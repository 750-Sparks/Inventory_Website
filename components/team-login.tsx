"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Cog,
  ArrowRight,
  Plus,
  Trash2,
  Loader2,
  Users,
  DollarSign,
  Building2,
  Hash,
} from "lucide-react";

const ROLES = [
  { value: "captain", label: "Team Captain" },
  { value: "driver", label: "Driver" },
  { value: "builder", label: "Builder" },
  { value: "programmer", label: "Programmer" },
  { value: "notebook", label: "Notebook" },
  { value: "mentor", label: "Mentor" },
];

interface MemberInput {
  name: string;
  role: string;
}

export function TeamLogin() {
  const router = useRouter();
  const [teamNumber, setTeamNumber] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [error, setError] = useState("");

  // Registration fields
  const [teamName, setTeamName] = useState("");
  const [organization, setOrganization] = useState("");
  const [budget, setBudget] = useState("");
  const [members, setMembers] = useState<MemberInput[]>([
    { name: "", role: "captain" },
  ]);

  const handleLookup = async () => {
    if (!teamNumber.trim()) {
      setError("Please enter a team number");
      return;
    }

    setIsChecking(true);
    setError("");

    try {
      const res = await fetch(
        `/api/team?number=${encodeURIComponent(teamNumber.trim())}`
      );
      const data = await res.json();

      if (data.exists) {
        // Team found - log in and redirect
        await fetch("/api/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "login",
            teamNumber: teamNumber.trim(),
          }),
        });
        router.push("/dashboard");
      } else {
        // Team not found - show registration
        setShowRegistration(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleRegister = async () => {
    if (!teamName.trim()) {
      setError("Please enter a team name");
      return;
    }

    setIsRegistering(true);
    setError("");

    try {
      const validMembers = members.filter((m) => m.name.trim());
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          teamNumber: teamNumber.trim(),
          name: teamName.trim(),
          organization: organization.trim(),
          budget: parseFloat(budget) || 0,
          members: validMembers,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/dashboard");
      } else {
        setError(data.error || "Failed to create team");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const addMember = () => {
    setMembers([...members, { name: "", role: "builder" }]);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (
    index: number,
    field: keyof MemberInput,
    value: string
  ) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo / Header */}
        <div className="text-center mb-8 animate-slide-in-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary animate-pulse-glow">
              <Cog className="h-7 w-7 animate-[spin_8s_linear_infinite]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">
            VEX Inventory System
          </h1>
          <p className="text-muted-foreground mt-2">
            Enter your team number to access your dashboard
          </p>
        </div>

        {!showRegistration ? (
          /* Team Number Entry */
          <Card className="p-8 animate-scale-in">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="team-number" className="text-sm font-medium">
                  Team Number
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="team-number"
                    placeholder="e.g. 750S"
                    value={teamNumber}
                    onChange={(e) => {
                      setTeamNumber(e.target.value.toUpperCase());
                      setError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                    className="pl-10 h-12 text-lg font-mono uppercase tracking-wider"
                    autoFocus
                    autoComplete="off"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {"If your team doesn't exist yet, you'll be able to set it up"}
                </p>
              </div>

              {error && (
                <p className="text-sm text-destructive animate-fade-in">
                  {error}
                </p>
              )}

              <Button
                onClick={handleLookup}
                disabled={isChecking || !teamNumber.trim()}
                className="w-full h-12 text-base font-semibold"
              >
                {isChecking ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        ) : (
          /* Registration Form */
          <Card className="p-8 animate-scale-in">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">
                  Set Up Team{" "}
                  <span className="font-mono text-primary">{teamNumber}</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {"We didn't find this team. Let's create it."}
                </p>
              </div>

              {/* Team Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name" className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Team Name
                  </Label>
                  <Input
                    id="team-name"
                    placeholder="e.g. Cyber Knights"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="organization"
                    className="flex items-center gap-2"
                  >
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Organization / School
                  </Label>
                  <Input
                    id="organization"
                    placeholder="e.g. Central High School"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Season Budget
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="e.g. 5000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="h-11"
                    min={0}
                  />
                </div>
              </div>

              {/* Members */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Team Members
                </Label>
                <div className="space-y-2">
                  {members.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 animate-fade-in"
                    >
                      <Input
                        placeholder="Member name"
                        value={member.name}
                        onChange={(e) =>
                          updateMember(index, "name", e.target.value)
                        }
                        className="flex-1 h-10"
                      />
                      <Select
                        value={member.role}
                        onValueChange={(v) => updateMember(index, "role", v)}
                      >
                        <SelectTrigger className="w-[140px] h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {members.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMember(index)}
                          className="shrink-0 h-10 w-10 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addMember}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>

              {error && (
                <p className="text-sm text-destructive animate-fade-in">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRegistration(false);
                    setError("");
                  }}
                  className="flex-1 h-11"
                >
                  Back
                </Button>
                <Button
                  onClick={handleRegister}
                  disabled={isRegistering || !teamName.trim()}
                  className="flex-1 h-11 font-semibold"
                >
                  {isRegistering ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Create Team
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
