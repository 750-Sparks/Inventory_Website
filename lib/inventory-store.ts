import type {
  InventoryPart,
  Build,
  BuildDetail,
  BOMUploadResponse,
  BOMResult,
  BOMAlert,
  Team,
  TeamMember,
  FinancialStats,
} from "./types";

// Sample inventory data with pricing
const sampleInventory: InventoryPart[] = [
  {
    part_number: "217-2700",
    name: "VEX 84 Tooth Gear",
    category: "Gears",
    in_stock: 10,
    min_required: 2,
    unit_price: 7.99,
    supplier: "vexstore",
    supplier_url: "https://www.vexrobotics.com/217-2700.html",
  },
  {
    part_number: "217-2701",
    name: "VEX 60 Tooth Gear",
    category: "Gears",
    in_stock: 8,
    min_required: 2,
    unit_price: 6.99,
    supplier: "vexstore",
    supplier_url: "https://www.vexrobotics.com/217-2701.html",
  },
  {
    part_number: "217-2702",
    name: "VEX 36 Tooth Gear",
    category: "Gears",
    in_stock: 15,
    min_required: 3,
    unit_price: 4.99,
    supplier: "robosource",
    supplier_url: "https://www.robosource.net/217-2702",
  },
  {
    part_number: "276-2177",
    name: "VEX V5 Smart Motor",
    category: "Motors",
    in_stock: 8,
    min_required: 2,
    unit_price: 39.99,
    supplier: "vexstore",
    supplier_url: "https://www.vexrobotics.com/276-2177.html",
  },
  {
    part_number: "276-4840",
    name: "VEX C-Channel 1x2x1x35",
    category: "Structure",
    in_stock: 20,
    min_required: 5,
    unit_price: 8.99,
    supplier: "robosource",
    supplier_url: "https://www.robosource.net/276-4840",
  },
  {
    part_number: "276-1496",
    name: 'VEX Steel Shaft 12" Long',
    category: "Motion",
    in_stock: 12,
    min_required: 3,
    unit_price: 2.99,
    supplier: "vexstore",
    supplier_url: "https://www.vexrobotics.com/276-1496.html",
  },
  {
    part_number: "228-2500",
    name: 'VEX Omni Wheel 4"',
    category: "Wheels",
    in_stock: 6,
    min_required: 4,
    unit_price: 14.99,
    supplier: "vexstore",
    supplier_url: "https://www.vexrobotics.com/228-2500.html",
  },
  {
    part_number: "217-4245",
    name: "VEX High Strength Gear 60T",
    category: "Gears",
    in_stock: 5,
    min_required: 1,
    unit_price: 9.99,
    supplier: "robosource",
    supplier_url: "https://www.robosource.net/217-4245",
  },
  {
    part_number: "276-2169",
    name: "VEX Shaft Collar",
    category: "Motion",
    in_stock: 30,
    min_required: 10,
    unit_price: 0.99,
    supplier: "vexstore",
    supplier_url: "https://www.vexrobotics.com/276-2169.html",
  },
  {
    part_number: "217-3662",
    name: "VEX Sprocket 18T",
    category: "Chain & Sprockets",
    in_stock: 8,
    min_required: 2,
    unit_price: 5.99,
    supplier: "robosource",
    supplier_url: "https://www.robosource.net/217-3662",
  },
  {
    part_number: "276-4851",
    name: "VEX V5 Brain",
    category: "Electronics",
    in_stock: 2,
    min_required: 1,
    unit_price: 299.99,
    supplier: "vexstore",
    supplier_url: "https://www.vexrobotics.com/276-4851.html",
  },
  {
    part_number: "276-4852",
    name: "VEX V5 Controller",
    category: "Electronics",
    in_stock: 2,
    min_required: 1,
    unit_price: 149.99,
    supplier: "vexstore",
    supplier_url: "https://www.vexrobotics.com/276-4852.html",
  },
  {
    part_number: "276-6050",
    name: "VEX GPS Sensor",
    category: "Sensors",
    in_stock: 1,
    min_required: 1,
    unit_price: 199.99,
    supplier: "vexstore",
    supplier_url: "https://www.vexrobotics.com/276-6050.html",
  },
  {
    part_number: "276-4850",
    name: "VEX V5 Battery",
    category: "Electronics",
    in_stock: 4,
    min_required: 2,
    unit_price: 39.99,
    supplier: "robosource",
    supplier_url: "https://www.robosource.net/276-4850",
  },
];

// Sample team data
const sampleTeam: Team = {
  id: "team-1",
  name: "Cyber Knights",
  number: "1234A",
  organization: "Central High School",
  budget: 5000,
  spent: 2847.52,
  created: "2024-08-15T00:00:00.000Z",
  members: [
    {
      id: "m1",
      name: "Alex Chen",
      email: "alex@example.com",
      role: "captain",
      joined: "2024-08-15T00:00:00.000Z",
    },
    {
      id: "m2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: "driver",
      joined: "2024-08-20T00:00:00.000Z",
    },
    {
      id: "m3",
      name: "Mike Williams",
      email: "mike@example.com",
      role: "builder",
      joined: "2024-08-20T00:00:00.000Z",
    },
    {
      id: "m4",
      name: "Dr. Emily Roberts",
      email: "eroberts@example.com",
      role: "mentor",
      joined: "2024-08-15T00:00:00.000Z",
    },
  ],
};

// In-memory storage
let inventory: InventoryPart[] = [...sampleInventory];
let builds: BuildDetail[] = [];
let team: Team = { ...sampleTeam };

export function getInventory(): InventoryPart[] {
  return [...inventory];
}

export function getInventoryValue(): number {
  return inventory.reduce(
    (sum, part) => sum + part.in_stock * part.unit_price,
    0
  );
}

export function updateInventoryItem(part: InventoryPart): void {
  const index = inventory.findIndex((p) => p.part_number === part.part_number);
  if (index >= 0) {
    inventory[index] = part;
  } else {
    inventory.push(part);
  }
}

export function deleteInventoryItem(partNumber: string): boolean {
  const index = inventory.findIndex((p) => p.part_number === partNumber);
  if (index >= 0) {
    inventory.splice(index, 1);
    return true;
  }
  return false;
}

export function updateStock(partNumber: string, newStock: number): boolean {
  const part = inventory.find((p) => p.part_number === partNumber);
  if (part) {
    part.in_stock = newStock;
    return true;
  }
  return false;
}

export function getTeam(): Team {
  return { ...team, members: [...team.members] };
}

export function updateTeam(updates: Partial<Team>): Team {
  team = { ...team, ...updates };
  return getTeam();
}

export function addTeamMember(member: Omit<TeamMember, "id" | "joined">): TeamMember {
  const newMember: TeamMember = {
    ...member,
    id: `m${Date.now()}`,
    joined: new Date().toISOString(),
  };
  team.members.push(newMember);
  return newMember;
}

export function removeTeamMember(memberId: string): boolean {
  const index = team.members.findIndex((m) => m.id === memberId);
  if (index >= 0) {
    team.members.splice(index, 1);
    return true;
  }
  return false;
}

export function getFinancialStats(): FinancialStats {
  const categoryTotals: Record<string, number> = {};
  let inventoryValue = 0;

  for (const part of inventory) {
    const value = part.in_stock * part.unit_price;
    inventoryValue += value;
    categoryTotals[part.category] = (categoryTotals[part.category] || 0) + value;
  }

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: inventoryValue > 0 ? (amount / inventoryValue) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totalBudget: team.budget,
    totalSpent: team.spent,
    inventoryValue,
    pendingOrders: 0,
    monthlySpend: [
      { month: "Sep", amount: 450.0 },
      { month: "Oct", amount: 892.5 },
      { month: "Nov", amount: 678.25 },
      { month: "Dec", amount: 826.77 },
    ],
    categoryBreakdown,
  };
}

export function getBuilds(): Build[] {
  return builds
    .map((build) => ({
      id: build.id,
      name: build.name,
      timestamp: build.timestamp,
      status: build.status,
      part_count: build.parts.length,
      total_cost: build.total_cost,
    }))
    .reverse();
}

export function getBuildById(id: number): BuildDetail | null {
  const build = builds.find((b) => b.id === id);
  if (!build) return null;

  return {
    ...build,
    parts: build.parts.map((part) => {
      const inventoryPart = inventory.find(
        (p) => p.part_number === part.part_number
      );
      return {
        ...part,
        name: inventoryPart?.name || part.name || "Unknown",
        category: inventoryPart?.category || "N/A",
        in_stock: inventoryPart?.in_stock ?? null,
        unit_price: inventoryPart?.unit_price || 0,
        total_price: (inventoryPart?.unit_price || 0) * part.quantity,
      };
    }),
  };
}

interface ParsedPart {
  part_number: string;
  quantity: number;
  name: string;
}

export function processBOM(
  partsList: ParsedPart[],
  buildName: string,
  simulationMode: boolean
): BOMUploadResponse {
  const results: BOMResult[] = [];
  const alerts: BOMAlert[] = [];
  let totalCost = 0;

  // Create build record
  const buildId = builds.length + 1;
  const build: BuildDetail = {
    id: buildId,
    name: buildName,
    timestamp: new Date().toISOString(),
    status: simulationMode ? "simulated" : "processed",
    parts: [],
    total_cost: 0,
  };

  for (const { part_number, quantity, name } of partsList) {
    build.parts.push({ part_number, quantity, name });

    const part = inventory.find((p) => p.part_number === part_number);

    if (!part) {
      alerts.push({
        type: "missing",
        part_number,
        name: name || "Unknown Part",
        needed: quantity,
        available: 0,
      });
      results.push({
        part_number,
        name: name || "Unknown Part",
        needed: quantity,
        available: 0,
        status: "missing",
        unit_price: 0,
        total_price: 0,
      });
    } else {
      const newStock = part.in_stock - quantity;
      const partTotal = part.unit_price * quantity;
      totalCost += partTotal;

      if (newStock < 0) {
        alerts.push({
          type: "insufficient",
          part_number,
          name: part.name,
          needed: quantity,
          available: part.in_stock,
          shortage: Math.abs(newStock),
        });
      } else if (newStock <= part.min_required) {
        alerts.push({
          type: "low",
          part_number,
          name: part.name,
          needed: quantity,
          available: part.in_stock,
          remaining: newStock,
          minimum: part.min_required,
        });
      }

      // Update inventory if not in simulation mode
      if (!simulationMode) {
        part.in_stock = newStock;
        team.spent += partTotal;
      }

      results.push({
        part_number,
        name: part.name,
        needed: quantity,
        available: part.in_stock + (simulationMode ? 0 : quantity),
        remaining: newStock,
        status:
          newStock < 0
            ? "insufficient"
            : newStock <= part.min_required
              ? "low"
              : "ok",
        unit_price: part.unit_price,
        total_price: partTotal,
      });
    }
  }

  build.total_cost = totalCost;
  builds.push(build);

  return {
    success: true,
    simulation: simulationMode,
    buildId,
    results,
    alerts,
    summary: {
      total_parts: results.length,
      missing: alerts.filter((a) => a.type === "missing").length,
      insufficient: alerts.filter((a) => a.type === "insufficient").length,
      low_stock: alerts.filter((a) => a.type === "low").length,
      ok: results.filter((r) => r.status === "ok").length,
      total_cost: totalCost,
    },
  };
}
