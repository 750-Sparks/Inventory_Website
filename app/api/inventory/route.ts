import { NextResponse } from "next/server";
import {
  getInventory,
  updateInventoryItem,
  updateStock,
  deleteInventoryItem,
  getBuilds,
  getBuildById,
  processBOM,
  getTeam,
  updateTeam,
  addTeamMember,
  removeTeamMember,
  getFinancialStats,
} from "@/lib/inventory-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const id = searchParams.get("id");

  try {
    if (action === "builds") {
      return NextResponse.json(getBuilds());
    }

    if (action === "build" && id) {
      const build = getBuildById(Number.parseInt(id));
      if (!build) {
        return NextResponse.json(
          { success: false, error: "Build not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(build);
    }

    if (action === "team") {
      return NextResponse.json(getTeam());
    }

    if (action === "finances") {
      return NextResponse.json(getFinancialStats());
    }

    return NextResponse.json(getInventory());
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === "upload-bom") {
      const { partsList, buildName, simulation } = data;
      const result = processBOM(partsList, buildName, simulation);
      return NextResponse.json(result);
    }

    if (action === "update-stock") {
      const { part_number, in_stock } = data;
      const success = updateStock(part_number, in_stock);
      if (success) {
        return NextResponse.json({ success: true, message: "Stock updated" });
      }
      return NextResponse.json(
        { success: false, error: "Part not found" },
        { status: 404 }
      );
    }

    if (action === "update-team") {
      const team = updateTeam(data);
      return NextResponse.json({ success: true, team });
    }

    if (action === "add-member") {
      const member = addTeamMember(data);
      return NextResponse.json({ success: true, member });
    }

    if (action === "remove-member") {
      const success = removeTeamMember(data.memberId);
      return NextResponse.json({ success });
    }

    // Default: update inventory item
    updateInventoryItem(data);
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

  try {
    const success = deleteInventoryItem(partNumber);
    if (success) {
      return NextResponse.json({ success: true, message: "Part deleted" });
    }
    return NextResponse.json(
      { success: false, error: "Part not found" },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
