"use client";

import React from "react"

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  UserPlus,
  Mail,
  Calendar,
  Crown,
  Gamepad2,
  Wrench,
  Code,
  GraduationCap,
  BookOpen,
  Trash2,
  Edit2,
  Users,
} from "lucide-react";
import type { Team, TeamMember, ROLES } from "@/lib/types";

interface TeamPageProps {
  team: Team;
  onAddMember: (member: Omit<TeamMember, "id" | "joined">) => void;
  onRemoveMember: (memberId: string) => void;
  onUpdateTeam: (updates: Partial<Team>) => void;
}

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  captain: Crown,
  driver: Gamepad2,
  builder: Wrench,
  programmer: Code,
  notebook: BookOpen,
  mentor: GraduationCap,
};

const roleColors: Record<string, string> = {
  captain: "bg-warning/10 text-warning border-warning/30",
  driver: "bg-chart-2/10 text-chart-2 border-chart-2/30",
  builder: "bg-primary/10 text-primary border-primary/30",
  programmer: "bg-chart-5/10 text-chart-5 border-chart-5/30",
  notebook: "bg-chart-3/10 text-chart-3 border-chart-3/30",
  mentor: "bg-muted text-muted-foreground border-border",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TeamPage({ team, onAddMember, onRemoveMember, onUpdateTeam }: TeamPageProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "builder" as TeamMember["role"],
  });
  const [editedTeam, setEditedTeam] = useState({
    name: team.name,
    number: team.number,
    organization: team.organization,
    budget: team.budget,
  });

  const handleAddMember = () => {
    if (newMember.name && newMember.email) {
      onAddMember(newMember);
      setNewMember({ name: "", email: "", role: "builder" });
      setIsAddDialogOpen(false);
    }
  };

  const handleUpdateTeam = () => {
    onUpdateTeam(editedTeam);
    setIsEditTeamOpen(false);
  };

  const membersByRole = team.members.reduce((acc, member) => {
    if (!acc[member.role]) acc[member.role] = [];
    acc[member.role].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-in-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team members and organization details
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Enter member name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newMember.role}
                  onValueChange={(value: TeamMember["role"]) =>
                    setNewMember({ ...newMember, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="captain">Team Captain</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="builder">Builder</SelectItem>
                    <SelectItem value="programmer">Programmer</SelectItem>
                    <SelectItem value="mentor">Mentor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddMember} className="w-full">
                Add Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Info Card */}
      <Card className="p-6 animate-slide-in-up opacity-0 stagger-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary text-2xl font-bold">
              {team.number}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{team.name}</h2>
              <p className="text-muted-foreground">{team.organization}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {team.members.length} members
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Est. {formatDate(team.created)}
                </span>
              </div>
            </div>
          </div>
          <Dialog open={isEditTeamOpen} onOpenChange={setIsEditTeamOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Team Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Team Name</Label>
                  <Input
                    value={editedTeam.name}
                    onChange={(e) => setEditedTeam({ ...editedTeam, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Team Number</Label>
                  <Input
                    value={editedTeam.number}
                    onChange={(e) => setEditedTeam({ ...editedTeam, number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Organization</Label>
                  <Input
                    value={editedTeam.organization}
                    onChange={(e) => setEditedTeam({ ...editedTeam, organization: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Season Budget ($)</Label>
                  <Input
                    type="number"
                    value={editedTeam.budget}
                    onChange={(e) => setEditedTeam({ ...editedTeam, budget: Number(e.target.value) })}
                  />
                </div>
                <Button onClick={handleUpdateTeam} className="w-full">
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Team Members Grid */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Team Members</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {team.members.map((member, index) => {
            const RoleIcon = roleIcons[member.role] || Users;
            return (
              <Card
                key={member.id}
                className={`p-5 hover:border-primary/30 transition-all duration-300 animate-slide-in-up opacity-0 stagger-${(index % 6) + 1}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-lg font-semibold uppercase">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <Badge
                        variant="outline"
                        className={`mt-1 text-xs ${roleColors[member.role]}`}
                      >
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {member.name} from the team? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onRemoveMember(member.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(member.joined)}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Role Summary */}
      <Card className="p-6 animate-slide-in-up">
        <h3 className="text-lg font-semibold mb-4">Team Composition</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {(["captain", "driver", "builder", "programmer", "mentor"] as const).map((role) => {
            const RoleIcon = roleIcons[role];
            const count = membersByRole[role]?.length || 0;
            return (
              <div
                key={role}
                className={`p-4 rounded-lg border ${roleColors[role]} transition-colors`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <RoleIcon className="h-5 w-5" />
                  <span className="font-medium capitalize">{role}s</span>
                </div>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
