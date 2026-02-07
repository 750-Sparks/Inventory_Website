"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Database,
  Download,
  Upload,
  Trash2,
  ExternalLink,
  Info,
} from "lucide-react";

export function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-slide-in-up">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your application preferences and data
        </p>
      </div>

      {/* App Info */}
      <Card className="p-6 animate-slide-in-up opacity-0 stagger-1">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Info className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">VEX Inventory System</h3>
            <p className="text-sm text-muted-foreground mt-1">
              CAD-to-Inventory Pipeline for VEX Robotics Teams
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline">Version 2.0.0</Badge>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                Next.js 16
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6 animate-slide-in-up opacity-0 stagger-2">
        <div className="flex items-center gap-3 mb-6">
          <Database className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Data Management</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div>
              <p className="font-medium">Export Inventory</p>
              <p className="text-sm text-muted-foreground">
                Download your inventory data as CSV
              </p>
            </div>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div>
              <p className="font-medium">Import Inventory</p>
              <p className="text-sm text-muted-foreground">
                Import inventory from CSV file
              </p>
            </div>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Upload className="h-4 w-4" />
              Import
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <div>
              <p className="font-medium text-destructive">Reset All Data</p>
              <p className="text-sm text-muted-foreground">
                Clear all inventory and build history
              </p>
            </div>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Supplier Links */}
      <Card className="p-6 animate-slide-in-up opacity-0 stagger-3">
        <div className="flex items-center gap-3 mb-6">
          <ExternalLink className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Supplier Resources</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="https://www.vexrobotics.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
          >
            <div className="p-2 rounded-lg bg-card">
              <span className="text-xl font-bold text-primary">VEX</span>
            </div>
            <div className="flex-1">
              <p className="font-medium group-hover:text-primary transition-colors">
                VEX Robotics Store
              </p>
              <p className="text-sm text-muted-foreground">
                Official VEX parts and products
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </a>
          <a
            href="https://www.robosource.net"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
          >
            <div className="p-2 rounded-lg bg-card">
              <span className="text-xl font-bold text-chart-2">RS</span>
            </div>
            <div className="flex-1">
              <p className="font-medium group-hover:text-primary transition-colors">
                RoboSource
              </p>
              <p className="text-sm text-muted-foreground">
                VEX parts and accessories
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </a>
        </div>
      </Card>

      {/* About */}
      <Card className="p-6 animate-slide-in-up opacity-0 stagger-4">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">About</h3>
        </div>
        <div className="prose prose-sm prose-invert max-w-none">
          <p className="text-muted-foreground">
            VEX Inventory System helps robotics teams manage their parts inventory efficiently.
            Upload BOMs from Fusion 360, track stock levels, monitor spending, and never run
            out of critical parts during competition season.
          </p>
          <p className="text-muted-foreground mt-3">
            Features include real-time inventory tracking, financial management with supplier
            integration (RoboSource and VEX Store), team member management, and build history
            with cost analysis.
          </p>
        </div>
      </Card>
    </div>
  );
}
