"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Users,
  DollarSign,
  Package,
  ArrowRight,
  CheckCircle2,
  Cog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { InventoryPart, Team, Build } from "@/lib/types";
import type { PageType } from "@/lib/types";

interface GettingStartedProps {
  team: Team;
  inventory: InventoryPart[];
  builds: Build[];
  onNavigate: (page: PageType) => void;
}

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  navigateTo: PageType;
  buttonLabel: string;
  isComplete: boolean;
}

export function GettingStarted({
  team,
  inventory,
  builds,
  onNavigate,
}: GettingStartedProps) {
  const steps: Step[] = [
    {
      id: "upload",
      title: "Upload Your First BOM",
      description:
        "Export a Bill of Materials from your CAD software (like Fusion 360) and upload it to start tracking parts.",
      icon: Upload,
      navigateTo: "upload",
      buttonLabel: "Upload BOM",
      isComplete: builds.length > 0,
    },
    {
      id: "inventory",
      title: "Review Your Inventory",
      description:
        "Check your parts list, set minimum stock levels, and keep track of what you have on hand.",
      icon: Package,
      navigateTo: "inventory",
      buttonLabel: "View Inventory",
      isComplete: inventory.length > 0,
    },
    {
      id: "team",
      title: "Add Team Members",
      description:
        "Add your teammates with their roles so everyone knows who handles what on your team.",
      icon: Users,
      navigateTo: "team",
      buttonLabel: "Manage Team",
      isComplete: team.members.length > 1,
    },
    {
      id: "finances",
      title: "Track Your Budget",
      description:
        "Monitor spending against your season budget, see cost breakdowns by category, and plan ahead.",
      icon: DollarSign,
      navigateTo: "finances",
      buttonLabel: "View Finances",
      isComplete: team.spent > 0,
    },
  ];

  const completedCount = steps.filter((s) => s.isComplete).length;
  const allComplete = completedCount === steps.length;

  if (allComplete) return null;

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Welcome Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Cog className="h-7 w-7 text-primary animate-[spin_8s_linear_infinite]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">
            Welcome, Team {team.number}
          </h1>
          <p className="text-muted-foreground mt-1">
            {"Let's get your inventory system set up. Complete these steps to get the most out of your dashboard."}
          </p>
        </div>
      </div>

      {/* Progress */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">Setup Progress</p>
          <p className="text-sm text-muted-foreground">
            {completedCount} of {steps.length} complete
          </p>
        </div>
        <div className="flex gap-2">
          {steps.map((step, i) => (
            <div
              key={step.id}
              className={cn(
                "h-2 flex-1 rounded-full transition-colors duration-500",
                step.isComplete ? "bg-primary" : "bg-muted"
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </Card>

      {/* Steps */}
      <div className="grid gap-4 sm:grid-cols-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Card
              key={step.id}
              className={cn(
                "p-6 transition-all duration-300 animate-slide-in-up opacity-0",
                `stagger-${index + 1}`,
                step.isComplete
                  ? "border-primary/20 bg-primary/5"
                  : "hover:border-primary/30"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    "p-2.5 rounded-lg",
                    step.isComplete ? "bg-primary/20" : "bg-muted"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      step.isComplete
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                </div>
                {step.isComplete && (
                  <CheckCircle2 className="h-5 w-5 text-primary animate-scale-in" />
                )}
              </div>
              <h3
                className={cn(
                  "font-semibold mb-1",
                  step.isComplete && "text-primary"
                )}
              >
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {step.description}
              </p>
              <Button
                variant={step.isComplete ? "outline" : "default"}
                size="sm"
                onClick={() => onNavigate(step.navigateTo)}
                className="gap-2"
              >
                {step.isComplete ? "Done" : step.buttonLabel}
                {!step.isComplete && <ArrowRight className="h-4 w-4" />}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
