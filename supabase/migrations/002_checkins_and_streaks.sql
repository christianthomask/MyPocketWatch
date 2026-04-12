-- supabase/migrations/002_checkins_and_streaks.sql
-- PocketWatch+ expansion: Check-ins, Streaks, Scheduled Notifications

-- ============================================
-- DAILY CHECK-INS
-- ============================================
CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,

  -- Spiritual
  bible_reading BOOLEAN DEFAULT false,
  bible_reading_notes TEXT,
  meeting_attended BOOLEAN DEFAULT false,
  meeting_name TEXT,
  ministry_hours DECIMAL(4,1) DEFAULT 0,
  ministry_notes TEXT,

  -- Health
  gym_completed BOOLEAN DEFAULT false,
  gym_workout TEXT,
  gym_duration_minutes INTEGER,
  meals_cooked INTEGER DEFAULT 0,
  meals_eaten_out INTEGER DEFAULT 0,
  packed_lunch BOOLEAN DEFAULT false,
  water_glasses INTEGER DEFAULT 0,

  -- Sleep
  bedtime TIME,
  waketime TIME,
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  phone_away_by_930 BOOLEAN DEFAULT false,

  -- Career / Learning
  coding_minutes INTEGER DEFAULT 0,
  coding_project TEXT,
  learning_minutes INTEGER DEFAULT 0,
  learning_topic TEXT,

  -- Creative
  writing_minutes INTEGER DEFAULT 0,
  dnd_prep_minutes INTEGER DEFAULT 0,

  -- Meta
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  daily_win TEXT,
  daily_struggle TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_checkins_date ON daily_checkins(date DESC);

-- ============================================
-- STREAKS
-- ============================================
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit TEXT UNIQUE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed DATE,
  total_completions INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO streaks (habit, current_streak, longest_streak) VALUES
  ('bible_reading', 0, 0),
  ('gym', 0, 0),
  ('packed_lunch', 0, 0),
  ('bed_by_1030', 0, 0),
  ('no_eating_out', 0, 0),
  ('phone_away_930', 0, 0),
  ('coding', 0, 0);

-- ============================================
-- NOTIFICATION SCHEDULE
-- ============================================
CREATE TABLE notification_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  cron_hour INTEGER NOT NULL,
  cron_minute INTEGER NOT NULL,
  days_of_week INTEGER[] DEFAULT '{0,1,2,3,4,5,6}',
  messages TEXT[] NOT NULL,
  message_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO notification_schedule (name, domain, cron_hour, cron_minute, days_of_week, messages) VALUES
  ('morning_bible', 'spiritual', 6, 15, '{0,1,2,3,4,5,6}',
   ARRAY['15 minutes with Jehovah before the world gets loud.', 'Your Bible reading streak is going — keep it alive.', 'Start the day grounded. Open your Bible.']),
  ('lunch_check', 'meals', 12, 0, '{1,2,3,4,5}',
   ARRAY['Did you pack lunch today? That''s $10-15 saved.', 'Eating from the container = money in your emergency fund.']),
  ('gym_reminder', 'health', 16, 15, '{1,3,5}',
   ARRAY['It''s a gym day. 45 minutes. You know what to do.', 'Push/Pull/Legs. Get in, get out, get stronger.', 'Your body did stone work all day. Now do YOUR work.']),
  ('wind_down', 'sleep', 21, 15, '{0,1,2,3,4,5,6}',
   ARRAY['15 minutes to phone-away time. Start wrapping up.', '9:30 is coming. Finish what you''re doing and put the phone down.', 'Tomorrow-you will thank tonight-you for going to bed on time.']),
  ('evening_checkin', 'health', 21, 0, '{0,1,2,3,4,5,6}',
   ARRAY['How was today? Take 30 seconds to check in.', 'Quick check-in time — log your wins before bed.']),
  ('weekly_review', 'all', 14, 30, '{0}',
   ARRAY['Your weekly life review is ready. See how you did across all 6 domains.']);

-- ============================================
-- EXPAND ALERTS TABLE
-- ============================================
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS domain TEXT DEFAULT 'financial';
CREATE INDEX IF NOT EXISTS idx_alerts_domain ON alerts(domain);

-- ============================================
-- WEEKLY STATS VIEW
-- ============================================
CREATE OR REPLACE VIEW weekly_stats AS
SELECT
  date_trunc('week', date)::date AS week_start,
  COUNT(*) AS days_checked_in,
  COUNT(*) FILTER (WHERE bible_reading) AS bible_days,
  COUNT(*) FILTER (WHERE gym_completed) AS gym_days,
  COUNT(*) FILTER (WHERE packed_lunch) AS packed_lunch_days,
  COUNT(*) FILTER (WHERE phone_away_by_930) AS phone_away_days,
  SUM(meals_cooked) AS total_meals_cooked,
  SUM(meals_eaten_out) AS total_meals_out,
  SUM(coding_minutes) AS total_coding_minutes,
  SUM(writing_minutes) AS total_writing_minutes,
  COALESCE(SUM(ministry_hours), 0) AS total_ministry_hours,
  ROUND(AVG(mood)::numeric, 1) AS avg_mood
FROM daily_checkins
GROUP BY date_trunc('week', date)
ORDER BY week_start DESC;

-- ============================================
-- RLS
-- ============================================
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON daily_checkins FOR ALL USING (true);
CREATE POLICY "service_role_all" ON streaks FOR ALL USING (true);
CREATE POLICY "service_role_all" ON notification_schedule FOR ALL USING (true);

CREATE POLICY "anon_read_checkins" ON daily_checkins FOR SELECT USING (true);
CREATE POLICY "anon_read_streaks" ON streaks FOR SELECT USING (true);
CREATE POLICY "anon_insert_checkins" ON daily_checkins FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_checkins" ON daily_checkins FOR UPDATE USING (true);
