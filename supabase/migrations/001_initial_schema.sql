-- supabase/migrations/001_initial_schema.sql

-- ============================================
-- TRANSACTIONS
-- ============================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plaid_transaction_id TEXT UNIQUE NOT NULL,
  date DATE NOT NULL,
  merchant_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  plaid_categories TEXT[],
  plaid_merchant_id TEXT,
  pending BOOLEAN DEFAULT false,
  analyzed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_analyzed ON transactions(analyzed) WHERE analyzed = false;

-- ============================================
-- BUDGETS
-- ============================================
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT UNIQUE NOT NULL,
  monthly_limit DECIMAL(10,2) NOT NULL,
  is_essential BOOLEAN DEFAULT false,
  is_frozen BOOLEAN DEFAULT false,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO budgets (category, monthly_limit, is_essential, is_frozen, notes) VALUES
  ('Rent',                 1200, true,  false, 'New lease starting May 2026'),
  ('Groceries',             280, true,  false, 'Cook 6 nights/week'),
  ('Fast Food',              60, false, false, 'Max 2x/week, $7-8 avg'),
  ('Coffee & Cafes',         30, false, false, 'Make at home, treat 1x/week'),
  ('Restaurants',            60, false, false, '1-2 meals out per month'),
  ('Gas & Fuel',            200, true,  false, 'Commute essential'),
  ('Auto Insurance',        129, true,  false, 'AAA — fixed cost'),
  ('MindPath',               85, true,  false, 'Mental health — non-negotiable'),
  ('Planet Fitness',         25, true,  false, 'Keep'),
  ('Supplements',             0, false, true,  'FROZEN — get nutrients from groceries'),
  ('Spotify',                19, false, false, 'Keep'),
  ('AI & Tech',              25, false, false, 'Claude Max + API only'),
  ('Apple Subs',              7, false, false, 'iCloud only'),
  ('Retail & Shopping',      40, false, true,  'FROZEN — 90-day moratorium on books/comics/electronics/Warhammer'),
  ('Convenience Stores',     20, false, false, 'Pack snacks from home'),
  ('Transfers to Friends',   30, false, false, 'Cannot lend what you do not have'),
  ('Other',                  60, false, false, 'Miscellaneous');

-- ============================================
-- MERCHANT CATEGORY MAP
-- ============================================
CREATE TABLE merchant_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_pattern TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO merchant_categories (merchant_pattern, category) VALUES
  ('McDonald''s%', 'Fast Food'),
  ('Burger King%', 'Fast Food'),
  ('Taco Bell%', 'Fast Food'),
  ('Wendy''s%', 'Fast Food'),
  ('Jack in the Box%', 'Fast Food'),
  ('Carl''s Jr%', 'Fast Food'),
  ('In-N-Out%', 'Fast Food'),
  ('Daves Hot Chicken%', 'Fast Food'),
  ('Panda Express%', 'Fast Food'),
  ('Jamba%', 'Fast Food'),
  ('Starbucks%', 'Coffee & Cafes'),
  ('Dutch Bros%', 'Coffee & Cafes'),
  ('Blackhorse%', 'Coffee & Cafes'),
  ('%Coffeehouse%', 'Coffee & Cafes'),
  ('%Coffee%', 'Coffee & Cafes'),
  ('Trader Joe%', 'Groceries'),
  ('Sprouts%', 'Groceries'),
  ('Vons%', 'Groceries'),
  ('Valley Fresh%', 'Groceries'),
  ('Whole Foods%', 'Groceries'),
  ('Grocery Outlet%', 'Groceries'),
  ('Smart%Final%', 'Groceries'),
  ('Aldi%', 'Groceries'),
  ('Shell%', 'Gas & Fuel'),
  ('Chevron%', 'Gas & Fuel'),
  ('Conserv Fuel%', 'Gas & Fuel'),
  ('7-Eleven%', 'Convenience Stores'),
  ('Circle K%', 'Convenience Stores'),
  ('Best Buy%', 'Retail & Shopping'),
  ('Target%', 'Retail & Shopping'),
  ('Staples%', 'Retail & Shopping'),
  ('Barnes%Noble%', 'Retail & Shopping'),
  ('Warhammer%', 'Retail & Shopping'),
  ('Captain Nemo%', 'Retail & Shopping'),
  ('Boo Boo Records%', 'Retail & Shopping'),
  ('Uniqlo%', 'Retail & Shopping'),
  ('IKEA%', 'Retail & Shopping'),
  ('Venice%AI%', 'AI & Tech'),
  ('OpenRouter%', 'AI & Tech'),
  ('Midjourney%', 'AI & Tech'),
  ('Anthropic%', 'AI & Tech'),
  ('OpenAI%', 'AI & Tech'),
  ('ElevenLabs%', 'AI & Tech'),
  ('DreamStudios%', 'AI & Tech'),
  ('Torry%AI%', 'AI & Tech'),
  ('TryHackMe%', 'AI & Tech'),
  ('Spotify%', 'Spotify'),
  ('Audible%', 'Other'),
  ('Amazon Prime%', 'Other'),
  ('Planet Fitness%', 'Planet Fitness'),
  ('GNC%', 'Supplements'),
  ('Herbalife%', 'Supplements'),
  ('MindPath%', 'MindPath'),
  ('AAA%', 'Auto Insurance'),
  ('Apple.com%', 'Apple Subs'),
  ('Venmo%Barry%', 'Rent'),
  ('Steam%', 'Retail & Shopping');

-- ============================================
-- ALERTS
-- ============================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'nudge', 'warning', 'urgent')),
  message TEXT NOT NULL,
  budget_note TEXT,
  acknowledged BOOLEAN DEFAULT false,
  delivered BOOLEAN DEFAULT false,
  delivery_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_alerts_created ON alerts(created_at DESC);
CREATE INDEX idx_alerts_severity ON alerts(severity);

-- ============================================
-- WEEKLY REPORTS
-- ============================================
CREATE TABLE weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_spent DECIMAL(10,2) NOT NULL,
  report_data JSONB NOT NULL,
  summary TEXT NOT NULL,
  wins TEXT[],
  concerns TEXT[],
  suggestion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PUSH SUBSCRIPTIONS
-- ============================================
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT UNIQUE NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PLAID CONNECTION
-- ============================================
CREATE TABLE plaid_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  cursor TEXT,
  institution_name TEXT DEFAULT 'Bank of America',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SETTINGS
-- ============================================
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO settings (key, value) VALUES
  ('alert_preferences', '{"max_daily": 3, "max_weekly": 10, "weekend_grace": true, "digest_mode": false, "quiet_hours_start": 22, "quiet_hours_end": 7}'),
  ('income', '{"monthly_takehome": 2714, "pay_frequency": "biweekly", "next_payday": "2026-04-24"}'),
  ('goals', '{"emergency_fund_target": 1000, "days_since_overdraft": 0, "target_monthly_spend": 2500}');

-- ============================================
-- BUDGET STATUS VIEW
-- ============================================
CREATE OR REPLACE VIEW budget_status AS
SELECT
  b.category,
  b.monthly_limit,
  b.is_essential,
  b.is_frozen,
  COALESCE(SUM(t.amount), 0) AS spent_this_month,
  b.monthly_limit - COALESCE(SUM(t.amount), 0) AS remaining,
  CASE
    WHEN b.monthly_limit = 0 THEN
      CASE WHEN COALESCE(SUM(t.amount), 0) > 0 THEN 999 ELSE 0 END
    ELSE ROUND(COALESCE(SUM(t.amount), 0) / b.monthly_limit * 100, 1)
  END AS pct_used,
  EXTRACT(DAY FROM now()) AS day_of_month,
  EXTRACT(DAY FROM (date_trunc('month', now()) + interval '1 month' - interval '1 day')) AS days_in_month
FROM budgets b
LEFT JOIN transactions t
  ON t.category = b.category
  AND t.date >= date_trunc('month', now())::date
  AND t.pending = false
GROUP BY b.category, b.monthly_limit, b.is_essential, b.is_frozen
ORDER BY
  CASE WHEN b.is_essential THEN 0 ELSE 1 END,
  COALESCE(SUM(t.amount), 0) / NULLIF(b.monthly_limit, 0) DESC NULLS LAST;

-- ============================================
-- HELPER: Count alerts in time window
-- ============================================
CREATE OR REPLACE FUNCTION alerts_in_window(hours_back INTEGER)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM alerts
  WHERE created_at > now() - (hours_back || ' hours')::interval
    AND severity != 'info';
$$ LANGUAGE sql STABLE;

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaid_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON transactions FOR ALL USING (true);
CREATE POLICY "service_role_all" ON budgets FOR ALL USING (true);
CREATE POLICY "service_role_all" ON alerts FOR ALL USING (true);
CREATE POLICY "service_role_all" ON weekly_reports FOR ALL USING (true);
CREATE POLICY "service_role_all" ON push_subscriptions FOR ALL USING (true);
CREATE POLICY "service_role_all" ON plaid_connections FOR ALL USING (true);
CREATE POLICY "service_role_all" ON settings FOR ALL USING (true);
CREATE POLICY "service_role_all" ON merchant_categories FOR ALL USING (true);

CREATE POLICY "anon_read_budgets" ON budgets FOR SELECT USING (true);
CREATE POLICY "anon_read_alerts" ON alerts FOR SELECT USING (true);
CREATE POLICY "anon_read_reports" ON weekly_reports FOR SELECT USING (true);
