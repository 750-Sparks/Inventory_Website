import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// GET: Look up a team by team_number, or get current team from cookie
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamNumber = searchParams.get("number");

  const supabase = await createClient();

  // Look up by number param
  if (teamNumber) {
    const { data: team, error } = await supabase
      .from("teams")
      .select("*")
      .eq("team_number", teamNumber.toUpperCase())
      .single();

    if (error || !team) {
      return NextResponse.json({ exists: false });
    }

    // Fetch members for this team
    const { data: members } = await supabase
      .from("team_members")
      .select("*")
      .eq("team_id", team.id)
      .order("joined_at", { ascending: true });

    return NextResponse.json({
      exists: true,
      team: { ...team, members: members || [] },
    });
  }

  // Get current team from cookie
  const cookieStore = await cookies();
  const currentTeamNumber = cookieStore.get("team_number")?.value;

  if (!currentTeamNumber) {
    return NextResponse.json({ error: "No team selected" }, { status: 401 });
  }

  const { data: team, error } = await supabase
    .from("teams")
    .select("*")
    .eq("team_number", currentTeamNumber)
    .single();

  if (error || !team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const { data: members } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", team.id)
    .order("joined_at", { ascending: true });

  return NextResponse.json({
    ...team,
    members: members || [],
  });
}

// POST: Create a new team or set team cookie
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // Set team cookie (login)
    if (action === "login") {
      const { teamNumber } = body;
      const cookieStore = await cookies();
      cookieStore.set("team_number", teamNumber.toUpperCase(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
      });
      return NextResponse.json({ success: true });
    }

    // Logout - clear cookie
    if (action === "logout") {
      const cookieStore = await cookies();
      cookieStore.delete("team_number");
      return NextResponse.json({ success: true });
    }

    // Register new team
    if (action === "register") {
      const { teamNumber, name, organization, budget, members } = body;
      const supabase = await createClient();

      // Check if team already exists
      const { data: existing } = await supabase
        .from("teams")
        .select("id")
        .eq("team_number", teamNumber.toUpperCase())
        .single();

      if (existing) {
        return NextResponse.json(
          { error: "Team already exists" },
          { status: 409 }
        );
      }

      // Create team
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({
          team_number: teamNumber.toUpperCase(),
          name: name || teamNumber,
          organization: organization || "",
          budget: budget || 0,
          spent: 0,
        })
        .select()
        .single();

      if (teamError || !team) {
        return NextResponse.json(
          { error: teamError?.message || "Failed to create team" },
          { status: 500 }
        );
      }

      // Add members if provided
      if (members && members.length > 0) {
        const memberRows = members.map(
          (m: { name: string; role: string }) => ({
            team_id: team.id,
            name: m.name,
            email: "",
            role: m.role || "builder",
          })
        );
        await supabase.from("team_members").insert(memberRows);
      }

      // Set team cookie
      const cookieStore = await cookies();
      cookieStore.set("team_number", teamNumber.toUpperCase(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });

      return NextResponse.json({ success: true, team });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
