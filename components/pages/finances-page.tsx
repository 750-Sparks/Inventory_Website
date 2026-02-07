"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  PiggyBank,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { InventoryPart, FinancialStats, Build } from "@/lib/types";

interface FinancesPageProps {
  inventory: InventoryPart[];
  financialStats: FinancialStats;
  builds: Build[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function FinancesPage({ inventory, financialStats, builds }: FinancesPageProps) {
  const budgetRemaining = financialStats.totalBudget - financialStats.totalSpent;
  const budgetPercent = (financialStats.totalSpent / financialStats.totalBudget) * 100;
  
  // Group parts by supplier
  const supplierTotals = inventory.reduce((acc, part) => {
    const supplier = part.supplier;
    if (!acc[supplier]) {
      acc[supplier] = { count: 0, value: 0 };
    }
    acc[supplier].count += part.in_stock;
    acc[supplier].value += part.in_stock * part.unit_price;
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  // Get most expensive items
  const expensiveItems = [...inventory]
    .sort((a, b) => b.unit_price * b.in_stock - a.unit_price * a.in_stock)
    .slice(0, 5);

  // Calculate total build costs
  const totalBuildCost = builds.reduce((sum, b) => sum + b.total_cost, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-slide-in-up">
        <h1 className="text-3xl font-bold tracking-tight">Finances</h1>
        <p className="text-muted-foreground mt-1">
          Track your team{"'"}s budget, spending, and inventory value
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 animate-slide-in-up opacity-0 stagger-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <PiggyBank className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Season Budget</p>
              <p className="text-2xl font-bold">{formatCurrency(financialStats.totalBudget)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 animate-slide-in-up opacity-0 stagger-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-chart-2/10">
              <ShoppingCart className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">{formatCurrency(financialStats.totalSpent)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs">
            <ArrowUpRight className="h-3 w-3 text-success" />
            <span className="text-success">{budgetPercent.toFixed(1)}% of budget</span>
          </div>
        </Card>

        <Card className="p-6 animate-slide-in-up opacity-0 stagger-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${budgetRemaining > 0 ? "bg-success/10" : "bg-danger/10"}`}>
              {budgetRemaining > 0 ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-danger" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-2xl font-bold ${budgetRemaining < 0 ? "text-danger" : ""}`}>
                {formatCurrency(budgetRemaining)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 animate-slide-in-up opacity-0 stagger-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-warning/10">
              <Package className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inventory Value</p>
              <p className="text-2xl font-bold">{formatCurrency(financialStats.inventoryValue)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card className="p-6 animate-slide-in-up opacity-0 stagger-5">
        <h3 className="text-lg font-semibold mb-4">Budget Progress</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {formatCurrency(financialStats.totalSpent)} spent of {formatCurrency(financialStats.totalBudget)}
            </span>
            <span className={budgetPercent > 90 ? "text-danger font-medium" : "text-muted-foreground"}>
              {budgetPercent.toFixed(1)}%
            </span>
          </div>
          <div className="relative">
            <Progress value={Math.min(budgetPercent, 100)} className="h-4" />
            {budgetPercent > 75 && (
              <div
                className="absolute top-0 bottom-0 w-px bg-warning"
                style={{ left: "75%" }}
              />
            )}
            {budgetPercent > 90 && (
              <div
                className="absolute top-0 bottom-0 w-px bg-danger"
                style={{ left: "90%" }}
              />
            )}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span className="text-warning">75%</span>
            <span className="text-danger">90%</span>
            <span>{formatCurrency(financialStats.totalBudget)}</span>
          </div>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Supplier Breakdown */}
        <Card className="p-6 animate-slide-in-up opacity-0 stagger-6">
          <h3 className="text-lg font-semibold mb-4">Spending by Supplier</h3>
          <div className="space-y-4">
            {Object.entries(supplierTotals).map(([supplier, data]) => {
              const supplierLabel = supplier === "vexstore" ? "VEX Store" : supplier === "robosource" ? "RoboSource" : "Other";
              const supplierUrl = supplier === "vexstore" 
                ? "https://www.vexrobotics.com" 
                : supplier === "robosource" 
                ? "https://www.robosource.net" 
                : null;
              const percentage = (data.value / financialStats.inventoryValue) * 100;
              
              return (
                <div key={supplier} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{supplierLabel}</span>
                      {supplierUrl && (
                        <a
                          href={supplierUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{formatCurrency(data.value)}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({data.count} parts)
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Monthly Spending */}
        <Card className="p-6 animate-slide-in-up opacity-0 stagger-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Spending</h3>
          <div className="space-y-3">
            {financialStats.monthlySpend.map((month, index) => {
              const maxSpend = Math.max(...financialStats.monthlySpend.map((m) => m.amount));
              const percentage = (month.amount / maxSpend) * 100;
              const isLatest = index === financialStats.monthlySpend.length - 1;
              
              return (
                <div key={month.month} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className={isLatest ? "font-medium" : "text-muted-foreground"}>
                      {month.month}
                      {isLatest && (
                        <Badge variant="outline" className="ml-2 text-xs">Current</Badge>
                      )}
                    </span>
                    <span className="font-medium">{formatCurrency(month.amount)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">
                {formatCurrency(financialStats.monthlySpend.reduce((sum, m) => sum + m.amount, 0))}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* High Value Items */}
      <Card className="p-6 animate-slide-in-up">
        <h3 className="text-lg font-semibold mb-4">Highest Value Items in Inventory</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium">Part</th>
                <th className="pb-3 font-medium">Supplier</th>
                <th className="pb-3 font-medium text-right">Unit Price</th>
                <th className="pb-3 font-medium text-right">Qty</th>
                <th className="pb-3 font-medium text-right">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {expensiveItems.map((part, index) => (
                <tr
                  key={part.part_number}
                  className={`border-b border-border/50 animate-fade-in opacity-0 stagger-${index + 1}`}
                >
                  <td className="py-3">
                    <div>
                      <p className="font-medium">{part.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {part.part_number}
                      </p>
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge variant="outline" className="text-xs">
                      {part.supplier === "vexstore" ? "VEX Store" : part.supplier === "robosource" ? "RoboSource" : "Other"}
                    </Badge>
                  </td>
                  <td className="py-3 text-right font-mono">
                    {formatCurrency(part.unit_price)}
                  </td>
                  <td className="py-3 text-right">{part.in_stock}</td>
                  <td className="py-3 text-right font-semibold">
                    {formatCurrency(part.unit_price * part.in_stock)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Build Costs */}
      {builds.length > 0 && (
        <Card className="p-6 animate-slide-in-up">
          <h3 className="text-lg font-semibold mb-4">Build Costs</h3>
          <div className="space-y-3">
            {builds.slice(0, 5).map((build) => (
              <div
                key={build.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div>
                  <p className="font-medium">{build.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {build.part_count} parts
                    <span className="mx-1">·</span>
                    {new Date(build.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(build.total_cost)}</p>
                  <Badge
                    variant={build.status === "simulated" ? "outline" : "default"}
                    className="text-xs"
                  >
                    {build.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          {builds.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border flex justify-between">
              <span className="text-muted-foreground">Total Build Costs</span>
              <span className="font-semibold">{formatCurrency(totalBuildCost)}</span>
            </div>
          )}
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 animate-slide-in-up">
        <Button variant="outline" className="gap-2 bg-transparent" asChild>
          <a href="https://www.robosource.net" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            Shop RoboSource
          </a>
        </Button>
        <Button variant="outline" className="gap-2 bg-transparent" asChild>
          <a href="https://www.vexrobotics.com" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            Shop VEX Store
          </a>
        </Button>
      </div>
    </div>
  );
}
