"use client";

import React from "react";
import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Loader2,
  X,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BOMUploadResponse, BOMResult, BOMAlert } from "@/lib/types";

interface UploadTabProps {
  onUploadComplete: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function UploadTab({ onUploadComplete }: UploadTabProps) {
  const [buildName, setBuildName] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [simulation, setSimulation] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<BOMUploadResponse | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      fileRef.current = file;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) {
      setFileName(file.name);
      fileRef.current = file;
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    const partNumberIdx = headers.findIndex(
      (h) => h === "part_number" || h === "part number"
    );
    const quantityIdx = headers.findIndex(
      (h) => h === "quantity" || h === "qty"
    );
    const nameIdx = headers.findIndex(
      (h) => h === "name" || h === "part name" || h === "part_name"
    );

    const partsList = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const partNumber = values[partNumberIdx];
      const quantity = Number.parseInt(values[quantityIdx] || "0");
      const name = values[nameIdx] || "";

      if (partNumber && quantity > 0) {
        partsList.push({ part_number: partNumber, quantity, name });
      }
    }
    return partsList;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileRef.current) return;

    setIsUploading(true);
    try {
      const text = await fileRef.current.text();
      const partsList = parseCSV(text);

      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upload-bom",
          partsList,
          buildName: buildName || "Unnamed Build",
          simulation,
        }),
      });

      const data = await response.json();
      setResults(data);
      onUploadComplete();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFileName(null);
    fileRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Upload Form */}
      <Card className="p-6 border-border bg-card">
        <div className="space-y-1 mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Bill of Materials
          </h2>
          <p className="text-sm text-muted-foreground">
            Export a CSV from Fusion 360 with columns:{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">
              part_number
            </code>
            ,{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">
              name
            </code>
            ,{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">
              quantity
            </code>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="buildName">Build Name</Label>
            <Input
              id="buildName"
              placeholder="e.g., Robot Arm v3"
              value={buildName}
              onChange={(e) => setBuildName(e.target.value)}
              className="bg-secondary/50 border-border"
            />
          </div>

          {/* File Drop Zone */}
          <div className="space-y-2">
            <Label>CSV File</Label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all duration-300",
                isDragOver
                  ? "border-primary bg-primary/10"
                  : fileName
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              {fileName ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{fileName}</p>
                    <p className="text-xs text-muted-foreground">Click to change file</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="ml-2 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Drop your CSV file here</p>
                  <p className="text-xs text-muted-foreground">or click to browse</p>
                </>
              )}
            </div>
          </div>

          {/* Simulation Toggle */}
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/50">
            <div className="relative">
              <input
                type="checkbox"
                checked={simulation}
                onChange={(e) => setSimulation(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-5 w-9 rounded-full bg-muted transition-colors peer-checked:bg-primary" />
              <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-foreground transition-transform peer-checked:translate-x-4" />
            </div>
            <div>
              <p className="font-medium">Simulation Mode</p>
              <p className="text-xs text-muted-foreground">
                Preview changes without affecting inventory
              </p>
            </div>
          </label>

          <Button
            type="submit"
            disabled={!fileName || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Process BOM
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-6 animate-slide-in-up">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <SummaryCard label="Parts OK" value={results.summary.ok} variant="success" />
            <SummaryCard label="Low Stock" value={results.summary.low_stock} variant="warning" />
            <SummaryCard label="Insufficient" value={results.summary.insufficient} variant="danger" />
            <SummaryCard label="Missing" value={results.summary.missing} variant="danger" />
            <div className="col-span-2 sm:col-span-1 rounded-lg border border-chart-2/30 bg-chart-2/10 p-4 text-center">
              <div className="text-2xl font-bold text-chart-2">
                {formatCurrency(results.summary.total_cost)}
              </div>
              <div className="text-sm text-chart-2/80">Total Cost</div>
            </div>
          </div>

          {results.simulation && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/10 p-4 text-primary">
              <Zap className="h-5 w-5" />
              <span className="font-medium">
                Simulation Mode - No inventory changes were made
              </span>
            </div>
          )}

          {/* Alerts */}
          {results.alerts.length > 0 && (
            <Card className="p-6 border-border bg-card">
              <h3 className="text-lg font-semibold mb-4">Alerts</h3>
              <div className="space-y-3">
                {results.alerts.map((alert, index) => (
                  <AlertItem key={index} alert={alert} index={index} />
                ))}
              </div>
            </Card>
          )}

          {results.alerts.length === 0 && (
            <div className="flex items-center gap-3 rounded-lg border border-primary/50 bg-primary/10 p-4 text-primary">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">
                All parts available! No issues detected.
              </span>
            </div>
          )}

          {/* Results Table */}
          <Card className="border-border bg-card overflow-hidden">
            <div className="p-6 pb-0">
              <h3 className="text-lg font-semibold">Parts Breakdown</h3>
            </div>
            <div className="overflow-x-auto p-6 pt-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Part</th>
                    <th className="pb-3 font-medium text-right">Needed</th>
                    <th className="pb-3 font-medium text-right">Available</th>
                    <th className="pb-3 font-medium text-right">Remaining</th>
                    <th className="pb-3 font-medium text-right">Unit Price</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                    <th className="pb-3 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.results.map((part, index) => (
                    <ResultRow key={part.part_number} part={part} index={index} />
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border">
                    <td colSpan={5} className="pt-3 text-right font-medium">
                      Total Build Cost:
                    </td>
                    <td className="pt-3 text-right font-bold text-primary">
                      {formatCurrency(results.summary.total_cost)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Sample CSV Format */}
      <Card className="p-6 border-border bg-card">
        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
          <FileText className="h-5 w-5 text-primary" />
          Sample CSV Format
        </h3>
        <pre className="overflow-x-auto rounded-lg bg-secondary p-4 font-mono text-sm text-muted-foreground">
          {`part_number,name,quantity
217-2700,VEX 84 Tooth Gear,2
276-2177,VEX V5 Smart Motor,4
228-2500,VEX Omni Wheel 4",4`}
        </pre>
        <p className="mt-3 text-sm text-muted-foreground">
          Save this format from Fusion 360 BOM export or create manually. Part prices will be pulled from your inventory.
        </p>
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "success" | "warning" | "danger";
}) {
  const colors = {
    success: "border-primary/30 bg-primary/10 text-primary",
    warning: "border-warning/30 bg-warning/10 text-warning",
    danger: "border-destructive/30 bg-destructive/10 text-destructive",
  };

  return (
    <div className={cn("rounded-lg border p-4 text-center transition-transform hover:scale-105", colors[variant])}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
}

function AlertItem({ alert, index }: { alert: BOMAlert; index: number }) {
  const config = {
    missing: {
      icon: AlertCircle,
      bg: "bg-destructive/10 border-destructive/30",
      iconColor: "text-destructive",
      title: "Missing Part",
    },
    insufficient: {
      icon: AlertTriangle,
      bg: "bg-warning/10 border-warning/30",
      iconColor: "text-warning",
      title: "Insufficient Stock",
    },
    low: {
      icon: Zap,
      bg: "bg-warning/10 border-warning/30",
      iconColor: "text-warning",
      title: "Low Stock Warning",
    },
  };

  const { icon: Icon, bg, iconColor, title } = config[alert.type];

  return (
    <div
      className={cn("flex items-start gap-3 rounded-lg border p-4 animate-slide-in-up", bg)}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <Icon className={cn("h-5 w-5 mt-0.5", iconColor)} />
      <div>
        <p className="font-medium">{title}: {alert.name}</p>
        <p className="text-sm text-muted-foreground">
          Part: {alert.part_number} | Needed: {alert.needed} | Available: {alert.available}
          {alert.shortage !== undefined && ` | Shortage: ${alert.shortage}`}
          {alert.remaining !== undefined && ` | Remaining: ${alert.remaining}`}
        </p>
      </div>
    </div>
  );
}

function ResultRow({ part, index }: { part: BOMResult; index: number }) {
  const statusColors = {
    ok: "bg-primary/20 text-primary",
    low: "bg-warning/20 text-warning",
    insufficient: "bg-destructive/20 text-destructive",
    missing: "bg-destructive/20 text-destructive",
  };

  return (
    <tr
      className="border-b border-border/50 hover:bg-secondary/20 transition-colors animate-fade-in"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <td className="py-3">
        <div>
          <p className="font-medium">{part.name}</p>
          <p className="text-xs text-muted-foreground font-mono">{part.part_number}</p>
        </div>
      </td>
      <td className="py-3 text-right">{part.needed}</td>
      <td className="py-3 text-right">{part.available}</td>
      <td className="py-3 text-right">{part.remaining !== undefined ? part.remaining : "N/A"}</td>
      <td className="py-3 text-right font-mono text-sm">
        {formatCurrency(part.unit_price)}
      </td>
      <td className="py-3 text-right font-semibold">
        {formatCurrency(part.total_price)}
      </td>
      <td className="py-3 text-center">
        <Badge className={cn("text-xs", statusColors[part.status])}>
          {part.status.toUpperCase()}
        </Badge>
      </td>
    </tr>
  );
}
