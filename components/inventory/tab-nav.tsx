"use client";

import React from "react"

import { Upload, Package, History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TabType } from "@/lib/types";

interface TabNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "upload", label: "Upload BOM", icon: Upload },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "history", label: "Build History", icon: History },
];

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "group relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-300",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  isActive && "scale-110"
                )}
              />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-fade-in" />
              )}
              <span
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-0.5 bg-primary/30 transition-transform origin-left duration-300",
                  isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                )}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
