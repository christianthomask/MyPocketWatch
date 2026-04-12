-- supabase/migrations/004_life_reviews.sql
-- PocketWatch+ Phase 3: Life Reviews

CREATE TABLE life_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  stats JSONB NOT NULL,
  summary TEXT NOT NULL,
  domain_scores JSONB,
  wins TEXT[],
  struggles TEXT[],
  suggestion TEXT,
  overall_grade TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_life_reviews_week ON life_reviews(week_start DESC);

ALTER TABLE life_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON life_reviews FOR ALL USING (true);
CREATE POLICY "anon_read_life_reviews" ON life_reviews FOR SELECT USING (true);
