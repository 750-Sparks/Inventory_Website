export interface InventoryPart {
  part_number: string;
  name: string;
  category: string;
  in_stock: number;
  min_required: number;
  unit_price: number;
  supplier: "robosource" | "vexstore" | "other";
  supplier_url?: string;
  last_ordered?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "captain" | "driver" | "builder" | "programmer" | "mentor" | "notebook";
  avatar?: string;
  joined: string;
}

export interface Team {
  id: string;
  name: string;
  number: string;
  organization: string;
  members: TeamMember[];
  created: string;
  budget: number;
  spent: number;
}

export interface Build {
  id: number;
  name: string;
  timestamp: string;
  status: "simulated" | "processed";
  part_count: number;
  total_cost: number;
}

export interface BuildDetail extends Omit<Build, "part_count"> {
  parts: BuildPart[];
}

export interface BuildPart {
  part_number: string;
  quantity: number;
  name: string;
  category?: string;
  in_stock?: number | null;
  unit_price?: number;
  total_price?: number;
}

export interface BOMResult {
  part_number: string;
  name: string;
  needed: number;
  available: number;
  remaining?: number;
  status: "ok" | "low" | "insufficient" | "missing";
  unit_price: number;
  total_price: number;
}

export interface BOMAlert {
  type: "missing" | "insufficient" | "low";
  part_number: string;
  name: string;
  needed: number;
  available: number;
  shortage?: number;
  remaining?: number;
  minimum?: number;
}

export interface BOMSummary {
  total_parts: number;
  missing: number;
  insufficient: number;
  low_stock: number;
  ok: number;
  total_cost: number;
}

export interface BOMUploadResponse {
  success: boolean;
  simulation: boolean;
  buildId: number;
  results: BOMResult[];
  alerts: BOMAlert[];
  summary: BOMSummary;
}

export interface FinancialStats {
  totalBudget: number;
  totalSpent: number;
  inventoryValue: number;
  pendingOrders: number;
  monthlySpend: { month: string; amount: number }[];
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
}

export type PageType =
  | "dashboard"
  | "inventory"
  | "upload"
  | "history"
  | "team"
  | "finances"
  | "settings";

export const CATEGORIES = [
  "Gears",
  "Motors",
  "Structure",
  "Motion",
  "Wheels",
  "Chain & Sprockets",
  "Electronics",
  "Pneumatics",
  "Hardware",
  "Sensors",
  "Custom",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const ROLES = [
  { value: "captain", label: "Team Captain" },
  { value: "driver", label: "Driver" },
  { value: "builder", label: "Builder" },
  { value: "programmer", label: "Programmer" },
  { value: "notebook", label: "Notebook" },
  { value: "mentor", label: "Mentor" },
] as const;
