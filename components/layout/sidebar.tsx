"use client";

import React from "react"

import { cn } from "@/lib/utils";
import type { PageType } from "@/lib/types";
import {
  LayoutDashboard,
  Package,
  Upload,
  History,
  Users,
  DollarSign,
  Settings,
  Cog,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  activePage: PageType;
  onPageChange: (page: PageType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  teamName: string;
  teamNumber: string;
}

const navItems: { id: PageType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "upload", label: "Upload BOM", icon: Upload },
  { id: "history", label: "Build History", icon: History },
  { id: "team", label: "Team", icon: Users },
  { id: "finances", label: "Finances", icon: DollarSign },
];

export function Sidebar({
  activePage,
  onPageChange,
  collapsed,
  onToggleCollapse,
  teamName,
  teamNumber,
}: SidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-border bg-[hsl(var(--sidebar))] transition-all duration-300 ease-in-out flex flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center border-b border-border px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Cog className="h-5 w-5 animate-[spin_8s_linear_infinite]" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in overflow-hidden">
                <h1 className="text-sm font-semibold truncate">{teamName}</h1>
                <p className="text-xs text-muted-foreground">Team {teamNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            const button = (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  "hover:bg-secondary/80",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                  `animate-slide-in-left stagger-${index + 1} opacity-0`
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return button;
          })}
        </nav>

        {/* External Links */}
        <div className="border-t border-border p-3 space-y-1">
          {!collapsed && (
            <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider animate-fade-in">
              Suppliers
            </p>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="https://www.robosource.net"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-200"
                )}
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">RoboSource</span>}
              </a>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">RoboSource</TooltipContent>
            )}
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="https://www.vexrobotics.com"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-200"
                )}
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">VEX Store</span>}
              </a>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">VEX Store</TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Settings & Collapse */}
        <div className="border-t border-border p-3 space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onPageChange("settings")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  "text-muted-foreground hover:text-foreground hover:bg-secondary/80",
                  activePage === "settings" && "bg-primary/10 text-primary"
                )}
              >
                <Settings className="h-5 w-5 shrink-0" />
                {!collapsed && <span>Settings</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">Settings</TooltipContent>
            )}
          </Tooltip>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full justify-center text-muted-foreground hover:text-foreground"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
