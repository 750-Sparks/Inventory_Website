"use client";

import { Cog, Database } from "lucide-react";

export function Header() {
  return (
    <header className="relative border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/50 shadow-lg shadow-primary/25">
                <Cog className="h-6 w-6 text-primary-foreground animate-[spin_8s_linear_infinite]" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                VEX Inventory System
              </h1>
              <p className="text-sm text-muted-foreground">
                CAD-to-Inventory Pipeline
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
            <Database className="h-3.5 w-3.5 text-primary" />
            <span>Live Inventory</span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
