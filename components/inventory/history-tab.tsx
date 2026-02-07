"use client";

import { useState, useEffect } from "react";
import {
  History,
  ChevronDown,
  ChevronUp,
  Calendar,
  Wrench,
  Loader2,
  Clock,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { Build, BuildDetail } from "@/lib/types";

interface HistoryTabProps {
  refreshTrigger: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function HistoryTab({ refreshTrigger }: HistoryTabProps) {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBuild, setExpandedBuild] = useState<number | null>(null);
  const [buildDetails, setBuildDetails] = useState<Record<number, BuildDetail>>({});

  const fetchBuilds = async () => {
    try {
      const response = await fetch("/api/inventory?action=builds");
      const data = await response.json();
      setBuilds(data);
    } catch (error) {
      console.error("Failed to fetch builds:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilds();
  }, [refreshTrigger]);

  const toggleBuild = async (buildId: number) => {
    if (expandedBuild === buildId) {
      setExpandedBuild(null);
      return;
    }

    setExpandedBuild(buildId);

    if (!buildDetails[buildId]) {
      try {
        const response = await fetch(`/api/inventory?action=build&id=${buildId}`);
        const data = await response.json();
        setBuildDetails((prev) => ({ ...prev, [buildId]: data }));
      } catch (error) {
        console.error("Failed to fetch build details:", error);
      }
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const totalSpent = builds
    .filter((b) => b.status !== "simulated")
    .reduce((sum, b) => sum + (b.total_cost || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 flex items-center gap-3 border-border bg-card">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <History className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Builds</p>
            <p className="text-xl font-bold">{builds.length}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-border bg-card">
          <div className="p-2.5 rounded-lg bg-chart-2/10">
            <DollarSign className="h-5 w-5 text-chart-2" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-xl font-bold">{formatCurrency(totalSpent)}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-border bg-card">
          <div className="p-2.5 rounded-lg bg-warning/10">
            <Wrench className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Simulations</p>
            <p className="text-xl font-bold">
              {builds.filter((b) => b.status === "simulated").length}
            </p>
          </div>
        </Card>
      </div>

      {/* Build List */}
      <Card className="border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : builds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <History className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">No builds yet</p>
            <p className="text-sm text-muted-foreground">Upload a BOM to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {builds.map((build, index) => (
              <BuildItem
                key={build.id}
                build={build}
                isExpanded={expandedBuild === build.id}
                details={buildDetails[build.id]}
                onToggle={() => toggleBuild(build.id)}
                formatDate={formatDate}
                getRelativeTime={getRelativeTime}
                index={index}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

interface BuildItemProps {
  build: Build;
  isExpanded: boolean;
  details?: BuildDetail;
  onToggle: () => void;
  formatDate: (timestamp: string) => string;
  getRelativeTime: (timestamp: string) => string;
  index: number;
}

function BuildItem({
  build,
  isExpanded,
  details,
  onToggle,
  formatDate,
  getRelativeTime,
  index,
}: BuildItemProps) {
  return (
    <div
      className={cn(
        "transition-all duration-300 animate-fade-in",
        isExpanded ? "bg-secondary/20" : "hover:bg-secondary/10"
      )}
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
              build.status === "simulated" ? "bg-warning/20" : "bg-primary/20"
            )}
          >
            <Wrench
              className={cn(
                "h-5 w-5",
                build.status === "simulated" ? "text-warning" : "text-primary"
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold">{build.name}</h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(build.timestamp)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {getRelativeTime(build.timestamp)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase",
                  build.status === "simulated"
                    ? "bg-warning/20 text-warning"
                    : "bg-primary/20 text-primary"
                )}
              >
                {build.status}
              </span>
              {build.total_cost !== undefined && build.total_cost > 0 && (
                <span className="font-semibold text-chart-2">
                  {formatCurrency(build.total_cost)}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{build.part_count} parts</p>
          </div>
          <div className="text-muted-foreground">
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="border-t border-border p-4">
          {details ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 text-left text-sm text-muted-foreground">
                    <th className="pb-2 font-medium">Part</th>
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 font-medium text-right">Qty Used</th>
                    <th className="pb-2 font-medium text-right">Unit Price</th>
                    <th className="pb-2 font-medium text-right">Total</th>
                    <th className="pb-2 font-medium text-right">Current Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {details.parts.map((part, partIndex) => (
                    <tr
                      key={part.part_number}
                      className="border-b border-border/30 hover:bg-secondary/20 transition-colors animate-fade-in"
                      style={{ animationDelay: `${partIndex * 30}ms` }}
                    >
                      <td className="py-2">
                        <div>
                          <p className="font-medium">{part.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{part.part_number}</p>
                        </div>
                      </td>
                      <td className="py-2">
                        <span className="rounded bg-secondary px-2 py-0.5 text-xs">
                          {part.category || "N/A"}
                        </span>
                      </td>
                      <td className="py-2 text-right">{part.quantity}</td>
                      <td className="py-2 text-right font-mono text-sm">
                        {formatCurrency(part.unit_price || 0)}
                      </td>
                      <td className="py-2 text-right font-semibold">
                        {formatCurrency((part.unit_price || 0) * part.quantity)}
                      </td>
                      <td className="py-2 text-right">
                        {part.in_stock !== null ? part.in_stock : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border">
                    <td colSpan={4} className="pt-2 text-right font-medium">
                      Build Total:
                    </td>
                    <td className="pt-2 text-right font-bold text-primary">
                      {formatCurrency(details.total_cost || 0)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
