-- supabase/migrations/003_goals_and_ministry.sql
-- PocketWatch+ Phase 2: Goals and Ministry Tracking

-- ============================================
-- GOALS & MILESTONES
-- ============================================
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value DECIMAL(10,2),
  current_value DECIMAL(10,2) DEFAULT 0,
  unit TEXT,
  target_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_goals_domain ON goals(domain);
CREATE INDEX idx_goals_status ON goals(status);

INSERT INTO goals (domain, title, target_value, current_value, unit, target_date) VALUES
  ('financial', 'Emergency fund', 1000, 0, 'dollars', '2026-12-31'),
  ('financial', 'Days since overdraft', 90, 0, 'days', NULL),
  ('spiritual', 'Daily Bible reading streak', 30, 0, 'days', NULL),
  ('spiritual', 'Monthly ministry hours', 15, 0, 'hours', NULL),
  ('health', 'Gym sessions this month', 12, 0, 'sessions', NULL),
  ('health', 'Consistent bedtime streak', 14, 0, 'days', NULL),
  ('career', 'Weekly coding hours', 6, 0, 'hours', NULL),
  ('career', 'Ship PocketWatch+', 1, 0, 'app', '2026-06-30'),
  ('meals', 'Pack lunch 5x/week', 5, 0, 'days/week', NULL);

-- ============================================
-- MINISTRY HOURS LOG
-- ============================================
CREATE TABLE ministry_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  hours DECIMAL(4,1) NOT NULL,
  type TEXT DEFAULT 'field',
  placements INTEGER DEFAULT 0,
  return_visits INTEGER DEFAULT 0,
  bible_studies INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ministry_date ON ministry_log(date DESC);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON goals FOR ALL USING (true);
CREATE POLICY "service_role_all" ON ministry_log FOR ALL USING (true);
CREATE POLICY "anon_read_goals" ON goals FOR SELECT USING (true);
CREATE POLICY "anon_read_ministry" ON ministry_log FOR SELECT USING (true);
CREATE POLICY "anon_insert_ministry" ON ministry_log FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_goals" ON goals FOR UPDATE USING (true);
