"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardPage } from "@/components/pages/dashboard-page";
import { TeamPage } from "@/components/pages/team-page";
import { FinancesPage } from "@/components/pages/finances-page";
import { SettingsPage } from "@/components/pages/settings-page";
import { UploadTab } from "@/components/inventory/upload-tab";
import { InventoryTab } from "@/components/inventory/inventory-tab";
import { HistoryTab } from "@/components/inventory/history-tab";
import type { PageType, InventoryPart, Team, FinancialStats, Build } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardRoute() {
  const router = useRouter();
  const [activePage, setActivePage] = useState<PageType>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Data states
  const [inventory, setInventory] = useState<InventoryPart[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [financialStats, setFinancialStats] = useState<FinancialStats | null>(null);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      const [invRes, teamRes, finRes, buildsRes] = await Promise.all([
        fetch("/api/inventory"),
        fetch("/api/inventory?action=team"),
        fetch("/api/inventory?action=finances"),
        fetch("/api/inventory?action=builds"),
      ]);

      // If team endpoint returns 401, redirect to login
      if (teamRes.status === 401) {
        router.push("/");
        return;
      }

      const [invData, teamData, finData, buildsData] = await Promise.all([
        invRes.json(),
        teamRes.json(),
        finRes.json(),
        buildsRes.json(),
      ]);

      setInventory(invData);
      setTeam(teamData);
      setFinancialStats(finData);
      setBuilds(buildsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleUploadComplete = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleAddMember = async (member: { name: string; email: string; role: string }) => {
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add-member", ...member }),
    });
    fetchData();
  };

  const handleRemoveMember = async (memberId: string) => {
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove-member", memberId }),
    });
    fetchData();
  };

  const handleUpdateTeam = async (updates: Partial<Team>) => {
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-team", ...updates }),
    });
    fetchData();
  };

  const handleLogout = async () => {
    await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/");
  };

  if (isLoading || !team || !financialStats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading inventory system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activePage={activePage}
        onPageChange={setActivePage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        teamName={team.name}
        teamNumber={team.number}
      />

      <main
        className={cn(
          "min-h-screen transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-lg font-semibold capitalize">
                {activePage === "upload" ? "Upload BOM" : activePage}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>System Online</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Switch Team
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {activePage === "dashboard" && (
            <DashboardPage
              inventory={inventory}
              financialStats={financialStats}
              recentBuilds={builds}
            />
          )}
          {activePage === "inventory" && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your parts inventory with real-time stock tracking
                </p>
              </div>
              <InventoryTab refreshTrigger={refreshTrigger} />
            </div>
          )}
          {activePage === "upload" && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Upload BOM</h1>
                <p className="text-muted-foreground mt-1">
                  Process bill of materials from CAD exports
                </p>
              </div>
              <UploadTab onUploadComplete={handleUploadComplete} />
            </div>
          )}
          {activePage === "history" && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Build History</h1>
                <p className="text-muted-foreground mt-1">
                  View past builds and their parts breakdown
                </p>
              </div>
              <HistoryTab refreshTrigger={refreshTrigger} />
            </div>
          )}
          {activePage === "team" && (
            <TeamPage
              team={team}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              onUpdateTeam={handleUpdateTeam}
            />
          )}
          {activePage === "finances" && (
            <FinancesPage
              inventory={inventory}
              financialStats={financialStats}
              builds={builds}
            />
          )}
          {activePage === "settings" && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}
