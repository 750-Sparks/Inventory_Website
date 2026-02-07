"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { InventoryPart, FinancialStats, Build } from "@/lib/types";

interface DashboardPageProps {
  inventory: InventoryPart[];
  financialStats: FinancialStats;
  recentBuilds: Build[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="animate-count-up">
      {prefix}
      {displayValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}
    </span>
  );
}

export function DashboardPage({ inventory, financialStats, recentBuilds }: DashboardPageProps) {
  const lowStockItems = inventory.filter((p) => p.in_stock <= p.min_required);
  const outOfStockItems = inventory.filter((p) => p.in_stock === 0);
  const budgetUsedPercent = (financialStats.totalSpent / financialStats.totalBudget) * 100;

  const stats = [
    {
      label: "Total Parts",
      value: inventory.length,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      label: "Inventory Value",
      value: financialStats.inventoryValue,
      prefix: "$",
      icon: DollarSign,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      change: "+8.2%",
      changeType: "positive" as const,
    },
    {
      label: "Low Stock",
      value: lowStockItems.length,
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
      change: outOfStockItems.length > 0 ? `${outOfStockItems.length} out` : "None out",
      changeType: outOfStockItems.length > 0 ? "negative" as const : "neutral" as const,
    },
    {
      label: "Budget Used",
      value: budgetUsedPercent,
      suffix: "%",
      icon: TrendingUp,
      color: budgetUsedPercent > 80 ? "text-danger" : "text-success",
      bgColor: budgetUsedPercent > 80 ? "bg-danger/10" : "bg-success/10",
      change: formatCurrency(financialStats.totalBudget - financialStats.totalSpent) + " left",
      changeType: "neutral" as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-slide-in-up">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your team{"'"}s inventory and finances
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className={`p-6 bg-card border-border hover:border-primary/30 transition-all duration-300 animate-slide-in-up opacity-0 stagger-${index + 1}`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {stat.changeType === "positive" && (
                    <ArrowUpRight className="h-3 w-3 text-success" />
                  )}
                  {stat.changeType === "negative" && (
                    <ArrowDownRight className="h-3 w-3 text-danger" />
                  )}
                  <span
                    className={
                      stat.changeType === "positive"
                        ? "text-success"
                        : stat.changeType === "negative"
                        ? "text-danger"
                        : "text-muted-foreground"
                    }
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">
                  {stat.prefix && stat.prefix}
                  <AnimatedNumber value={stat.value} />
                  {stat.suffix && stat.suffix}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Budget Progress */}
        <Card className="p-6 lg:col-span-2 animate-slide-in-up opacity-0 stagger-5">
          <h3 className="text-lg font-semibold mb-4">Budget Overview</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Season Budget</span>
                <span className="text-sm font-medium">
                  {formatCurrency(financialStats.totalSpent)} / {formatCurrency(financialStats.totalBudget)}
                </span>
              </div>
              <Progress value={budgetUsedPercent} className="h-3" />
            </div>
            
            {/* Monthly Spend Chart */}
            <div>
              <p className="text-sm text-muted-foreground mb-3">Monthly Spending</p>
              <div className="flex items-end gap-2 h-32">
                {financialStats.monthlySpend.map((month, i) => {
                  const maxSpend = Math.max(...financialStats.monthlySpend.map((m) => m.amount));
                  const height = (month.amount / maxSpend) * 100;
                  return (
                    <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className={`w-full bg-primary/20 rounded-t-sm relative overflow-hidden animate-slide-in-up opacity-0 stagger-${i + 1}`}
                        style={{ height: `${height}%` }}
                      >
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-sm transition-all duration-1000"
                          style={{ height: `${height}%`, animationDelay: `${i * 100}ms` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{month.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 animate-slide-in-up opacity-0 stagger-6">
          <h3 className="text-lg font-semibold mb-4">Recent Builds</h3>
          {recentBuilds.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No builds yet. Upload a BOM to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {recentBuilds.slice(0, 5).map((build) => (
                <div
                  key={build.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{build.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {build.part_count} parts
                    </p>
                  </div>
                  <Badge
                    variant={build.status === "simulated" ? "outline" : "default"}
                    className="text-xs"
                  >
                    {build.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="p-6 border-warning/30 bg-warning/5 animate-slide-in-up">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-warning">Low Stock Alert</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                The following parts are running low and may need to be reordered:
              </p>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.slice(0, 6).map((part) => (
                  <Badge key={part.part_number} variant="outline" className="text-xs">
                    {part.name} ({part.in_stock} left)
                  </Badge>
                ))}
                {lowStockItems.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{lowStockItems.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Category Breakdown */}
      <Card className="p-6 animate-slide-in-up">
        <h3 className="text-lg font-semibold mb-4">Inventory by Category</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {financialStats.categoryBreakdown.slice(0, 6).map((cat, index) => (
            <div
              key={cat.category}
              className={`p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors animate-fade-in opacity-0 stagger-${index + 1}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{cat.category}</span>
                <span className="text-xs text-muted-foreground">
                  {cat.percentage.toFixed(1)}%
                </span>
              </div>
              <p className="text-lg font-semibold">{formatCurrency(cat.amount)}</p>
              <Progress value={cat.percentage} className="h-1.5 mt-2" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
