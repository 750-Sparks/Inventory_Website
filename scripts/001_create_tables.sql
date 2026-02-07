-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  organization TEXT NOT NULL DEFAULT '',
  budget NUMERIC(10,2) NOT NULL DEFAULT 0,
  spent NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'builder',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  part_number TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Hardware',
  in_stock INTEGER NOT NULL DEFAULT 0,
  min_required INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  supplier TEXT NOT NULL DEFAULT 'other',
  supplier_url TEXT,
  last_ordered TIMESTAMPTZ,
  UNIQUE(team_id, part_number)
);

-- Builds table
CREATE TABLE IF NOT EXISTS builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processed',
  total_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Build parts table
CREATE TABLE IF NOT EXISTS build_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  part_number TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1
);

-- Disable RLS for all tables (team-scoped via application-level team_number cookie, no auth)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_parts ENABLE ROW LEVEL SECURITY;

-- Allow all operations via anon key (no user auth, team scoping done in app)
CREATE POLICY "allow_all_teams" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_team_members" ON team_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_builds" ON builds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_build_parts" ON build_parts FOR ALL USING (true) WITH CHECK (true);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_teams_number ON teams(team_number);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_inventory_team ON inventory(team_id);
CREATE INDEX IF NOT EXISTS idx_builds_team ON builds(team_id);
CREATE INDEX IF NOT EXISTS idx_build_parts_build ON build_parts(build_id);
