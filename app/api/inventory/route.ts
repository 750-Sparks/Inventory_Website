import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// Helper to get the current team from the cookie
async function getCurrentTeam() {
  const cookieStore = await cookies();
  const teamNumber = cookieStore.get("team_number")?.value;
  if (!teamNumber) return null;

  const supabase = await createClient();
  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("team_number", teamNumber)
    .single();

  return team;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const id = searchParams.get("id");

  const team = await getCurrentTeam();
  if (!team) {
    return NextResponse.json({ error: "No team selected" }, { status: 401 });
  }

  const supabase = await createClient();

  try {
    if (action === "builds") {
      const { data: builds } = await supabase
        .from("builds")
        .select("*, build_parts(count)")
        .eq("team_id", team.id)
        .order("created_at", { ascending: false });

      const formatted = (builds || []).map((b) => ({
        id: b.id,
        name: b.name,
        timestamp: b.created_at,
        status: b.status,
        part_count: b.build_parts?.[0]?.count || 0,
        total_cost: parseFloat(b.total_cost) || 0,
      }));

      return NextResponse.json(formatted);
    }

    if (action === "build" && id) {
      const { data: build } = await supabase
        .from("builds")
        .select("*")
        .eq("id", id)
        .eq("team_id", team.id)
        .single();

      if (!build) {
        return NextResponse.json(
          { success: false, error: "Build not found" },
          { status: 404 }
        );
      }

      const { data: parts } = await supabase
        .from("build_parts")
        .select("*")
        .eq("build_id", build.id);

      // Enrich parts with inventory info
      const { data: inventoryParts } = await supabase
        .from("inventory")
        .select("*")
        .eq("team_id", team.id);

      const inventoryMap = new Map(
        (inventoryParts || []).map((p) => [p.part_number, p])
      );

      const enrichedParts = (parts || []).map((p) => {
        const inv = inventoryMap.get(p.part_number);
        return {
          part_number: p.part_number,
          quantity: p.quantity,
          name: inv?.name || p.name || "Unknown",
          category: inv?.category || "N/A",
          in_stock: inv?.in_stock ?? null,
          unit_price: parseFloat(inv?.unit_price || "0"),
          total_price: parseFloat(inv?.unit_price || "0") * p.quantity,
        };
      });

      return NextResponse.json({
        id: build.id,
        name: build.name,
        timestamp: build.created_at,
        status: build.status,
        total_cost: parseFloat(build.total_cost) || 0,
        parts: enrichedParts,
      });
    }

    if (action === "team") {
      const { data: members } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", team.id)
        .order("joined_at", { ascending: true });

      return NextResponse.json({
        id: team.id,
        name: team.name,
        number: team.team_number,
        organization: team.organization || "",
        budget: parseFloat(team.budget) || 0,
        spent: parseFloat(team.spent) || 0,
        created: team.created_at,
        members: (members || []).map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email || "",
          role: m.role || "builder",
          joined: m.joined_at,
        })),
      });
    }

    if (action === "finances") {
      const { data: inventoryParts } = await supabase
        .from("inventory")
        .select("*")
        .eq("team_id", team.id);

      const categoryTotals: Record<string, number> = {};
      let inventoryValue = 0;

      for (const part of inventoryParts || []) {
        const value = part.in_stock * parseFloat(part.unit_price || "0");
        inventoryValue += value;
        categoryTotals[part.category] =
          (categoryTotals[part.category] || 0) + value;
      }

      const categoryBreakdown = Object.entries(categoryTotals)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: inventoryValue > 0 ? (amount / inventoryValue) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      return NextResponse.json({
        totalBudget: parseFloat(team.budget) || 0,
        totalSpent: parseFloat(team.spent) || 0,
        inventoryValue,
        pendingOrders: 0,
        monthlySpend: [],
        categoryBreakdown,
      });
    }

    // Default: return inventory
    const { data: inventoryParts } = await supabase
      .from("inventory")
      .select("*")
      .eq("team_id", team.id)
      .order("name", { ascending: true });

    const formatted = (inventoryParts || []).map((p) => ({
      part_number: p.part_number,
      name: p.name,
      category: p.category || "Hardware",
      in_stock: p.in_stock,
      min_required: p.min_required,
      unit_price: parseFloat(p.unit_price || "0"),
      supplier: p.supplier || "other",
      supplier_url: p.supplier_url || undefined,
      last_ordered: p.last_ordered || undefined,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const team = await getCurrentTeam();
  if (!team) {
    return NextResponse.json({ error: "No team selected" }, { status: 401 });
  }

  const supabase = await createClient();

  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === "upload-bom") {
      const { partsList, buildName, simulation } = data;

      // Get current inventory
      const { data: inventoryParts } = await supabase
        .from("inventory")
        .select("*")
        .eq("team_id", team.id);

      const inventoryMap = new Map(
        (inventoryParts || []).map((p) => [p.part_number, p])
      );

      const results: Array<{
        part_number: string;
        name: string;
        needed: number;
        available: number;
        remaining?: number;
        status: string;
        unit_price: number;
        total_price: number;
      }> = [];
      const alerts: Array<{
        type: string;
        part_number: string;
        name: string;
        needed: number;
        available: number;
        shortage?: number;
        remaining?: number;
        minimum?: number;
      }> = [];
      let totalCost = 0;

      // Create build record
      const { data: build } = await supabase
        .from("builds")
        .insert({
          team_id: team.id,
          name: buildName,
          status: simulation ? "simulated" : "processed",
          total_cost: 0,
        })
        .select()
        .single();

      const buildParts: Array<{
        build_id: string;
        part_number: string;
        name: string;
        quantity: number;
      }> = [];

      for (const { part_number, quantity, name } of partsList) {
        buildParts.push({
          build_id: build!.id,
          part_number,
          name: name || "",
          quantity,
        });

        const part = inventoryMap.get(part_number);

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
          const unitPrice = parseFloat(part.unit_price || "0");
          const newStock = part.in_stock - quantity;
          const partTotal = unitPrice * quantity;
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

          // Update stock if not simulation
          if (!simulation) {
            await supabase
              .from("inventory")
              .update({ in_stock: newStock })
              .eq("id", part.id);

            // Update team spent
            await supabase
              .from("teams")
              .update({ spent: parseFloat(team.spent) + partTotal })
              .eq("id", team.id);
          }

          results.push({
            part_number,
            name: part.name,
            needed: quantity,
            available: part.in_stock + (simulation ? 0 : quantity),
            remaining: newStock,
            status:
              newStock < 0
                ? "insufficient"
                : newStock <= part.min_required
                  ? "low"
                  : "ok",
            unit_price: unitPrice,
            total_price: partTotal,
          });
        }
      }

      // Insert build parts
      if (buildParts.length > 0) {
        await supabase.from("build_parts").insert(buildParts);
      }

      // Update build total cost
      await supabase
        .from("builds")
        .update({ total_cost: totalCost })
        .eq("id", build!.id);

      return NextResponse.json({
        success: true,
        simulation,
        buildId: build!.id,
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
      });
    }

    if (action === "update-stock") {
      const { part_number, in_stock } = data;
      const { error } = await supabase
        .from("inventory")
        .update({ in_stock })
        .eq("team_id", team.id)
        .eq("part_number", part_number);

      if (error) {
        return NextResponse.json(
          { success: false, error: "Part not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, message: "Stock updated" });
    }

    if (action === "update-team") {
      const updates: Record<string, unknown> = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.organization !== undefined) updates.organization = data.organization;
      if (data.budget !== undefined) updates.budget = data.budget;
      if (data.spent !== undefined) updates.spent = data.spent;

      if (Object.keys(updates).length > 0) {
        await supabase.from("teams").update(updates).eq("id", team.id);
      }

      return NextResponse.json({ success: true });
    }

    if (action === "add-member") {
      const { error } = await supabase.from("team_members").insert({
        team_id: team.id,
        name: data.name,
        email: data.email || "",
        role: data.role || "builder",
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true });
    }

    if (action === "remove-member") {
      await supabase
        .from("team_members")
        .delete()
        .eq("id", data.memberId)
        .eq("team_id", team.id);

      return NextResponse.json({ success: true });
    }

    // Default: update/insert inventory item
    const { data: existing } = await supabase
      .from("inventory")
      .select("id")
      .eq("team_id", team.id)
      .eq("part_number", data.part_number)
      .single();

    if (existing) {
      await supabase
        .from("inventory")
        .update({
          name: data.name,
          category: data.category,
          in_stock: data.in_stock,
          min_required: data.min_required,
          unit_price: data.unit_price,
          supplier: data.supplier,
          supplier_url: data.supplier_url || null,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("inventory").insert({
        team_id: team.id,
        part_number: data.part_number,
        name: data.name,
        category: data.category || "Hardware",
        in_stock: data.in_stock || 0,
        min_required: data.min_required || 0,
        unit_price: data.unit_price || 0,
        supplier: data.supplier || "other",
        supplier_url: data.supplier_url || null,
      });
    }

    return NextResponse.json({ success: true, message: "Inventory updated" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const partNumber = searchParams.get("partNumber");

  if (!partNumber) {
    return NextResponse.json(
      { success: false, error: "Part number required" },
      { status: 400 }
    );
  }

  const team = await getCurrentTeam();
  if (!team) {
    return NextResponse.json({ error: "No team selected" }, { status: 401 });
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("inventory")
      .delete()
      .eq("team_id", team.id)
      .eq("part_number", partNumber);

    if (error) {
      return NextResponse.json(
        { success: false, error: "Part not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Part deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
