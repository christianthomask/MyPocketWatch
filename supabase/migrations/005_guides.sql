-- supabase/migrations/005_guides.sql
-- PocketWatch+ Guides: Schedule, Meals, Grocery, Workout

-- ============================================
-- DAILY SCHEDULE BLOCKS
-- ============================================
CREATE TABLE schedule_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_type TEXT NOT NULL,
  time TEXT NOT NULL,
  duration_minutes INTEGER,
  label TEXT NOT NULL,
  detail TEXT,
  domain TEXT,
  color TEXT,
  sort_order INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_schedule_day_type ON schedule_blocks(day_type, sort_order);

INSERT INTO schedule_blocks (day_type, time, duration_minutes, label, detail, domain, color, sort_order) VALUES
  ('weekday', '06:15', 15, 'Wake Up + Bible Reading', '15 min. Daily text + a chapter. Non-negotiable first thing.', 'spiritual', '#a78bfa', 1),
  ('weekday', '06:30', 30, 'Breakfast + Coffee + Pack Lunch', 'Eggs or oatmeal. Thermos. Grab prepped container from fridge.', 'meals', '#fbbf24', 2),
  ('weekday', '07:00', NULL, 'Commute + Audio Learning', 'Podcast, audiobook (Libby), or JW talks.', 'learning', '#60a5fa', 3),
  ('weekday', '07:30', 510, 'Stoneworks', 'Full shift. Arrive on time or early.', NULL, '#4b5a6f', 4),
  ('weekday', '16:00', 30, 'Transition Window', 'Change clothes. Quick snack. 15 min decompress — no phone scrolling.', NULL, '#4b5a6f', 5),
  ('weekday', '16:30', 60, 'Gym (MWF) or Deep Work (TuTh)', 'Mon/Wed/Fri: Planet Fitness 45 min. Tue/Thu: Coding or freelance 90 min.', 'health', '#34d399', 6),
  ('weekday', '18:00', 45, 'Cook + Eat Dinner', '15-20 min cooking (veggies prepped Sunday). Eat at table, not a screen.', 'meals', '#fbbf24', 7),
  ('weekday', '18:45', 120, 'Meeting Night or Evening Block', 'Tue/Thu: Kingdom Hall. Other nights: coding, writing, D&D prep, study.', 'spiritual', '#a78bfa', 8),
  ('weekday', '21:00', 30, 'Free Time (Earned)', 'Game, watch something, call a friend. Clock is running.', NULL, '#60a5fa', 9),
  ('weekday', '21:30', 60, 'Wind Down — Phone Away', 'Phone on charger in kitchen. Shower. Physical book in bed.', 'sleep', '#f472b6', 10),
  ('weekday', '22:30', 465, 'Lights Out', '7h45m of sleep. Foundation of everything.', 'sleep', '#a78bfa', 11),
  ('saturday', '06:15', 15, 'Wake Up (Same Time)', 'Consistency is the whole game.', NULL, '#fbbf24', 1),
  ('saturday', '06:30', 45, 'Personal Study / Meeting Prep', 'Watchtower prep, personal Bible reading, or spiritual research.', 'spiritual', '#a78bfa', 2),
  ('saturday', '07:15', 30, 'Breakfast', 'Cook something nicer — you have time.', 'meals', '#fbbf24', 3),
  ('saturday', '08:00', 180, 'Ministry', 'Field service with your group. Log your time.', 'spiritual', '#a78bfa', 4),
  ('saturday', '11:00', 60, 'Gym (Full Session)', 'Long session day. 60 min.', 'health', '#34d399', 5),
  ('saturday', '12:30', 60, 'Lunch + Rest', 'Eat, shower, decompress.', NULL, '#4b5a6f', 6),
  ('saturday', '13:30', 150, 'Deep Work Block', 'Rotate: coding, fiction writing, D&D prep, learning.', 'career', '#60a5fa', 7),
  ('saturday', '16:00', 180, 'Free Time / Social', 'Friends (free activities). Hike. Read. Game.', NULL, '#f472b6', 8),
  ('saturday', '19:00', 60, 'Dinner', 'Cook or one flex meal ($15-20).', 'meals', '#fbbf24', 9),
  ('saturday', '21:30', 60, 'Wind Down', 'Same as weekdays. Phone away.', 'sleep', '#a78bfa', 10),
  ('sunday', '06:15', 30, 'Wake Up + Extended Bible Reading', 'Longer session: 20-30 min.', 'spiritual', '#a78bfa', 1),
  ('sunday', '07:00', 30, 'Breakfast', '', 'meals', '#fbbf24', 2),
  ('sunday', '08:00', 240, 'Meeting + Fellowship', 'Weekend meeting. Stay for fellowship — invest in congregation relationships.', 'spiritual', '#a78bfa', 3),
  ('sunday', '12:00', 60, 'Grocery Shopping', 'GO + TJs with your list. 45 min. Only what''s on the list.', 'meals', '#fbbf24', 4),
  ('sunday', '13:00', 90, 'Meal Prep', '90-min session. Big batch + rice + portion lunches + prep veggies + snack bags + coffee.', 'meals', '#34d399', 5),
  ('sunday', '14:30', 15, 'Weekly Review', 'Check PocketWatch. Review budget. Plan week. Set 3 priorities.', 'financial', '#2dd4bf', 6),
  ('sunday', '15:00', 240, 'Free Time / Rest', 'Read. Nap. D&D prep. Creative writing. Whatever fills your cup.', NULL, '#f472b6', 7),
  ('sunday', '19:00', NULL, 'Light Dinner + Prep for Monday', 'Easy meal. Prep work bag.', 'meals', '#fbbf24', 8),
  ('sunday', '21:30', 60, 'Wind Down', '', 'sleep', '#a78bfa', 9);

-- ============================================
-- MEAL PLANS
-- ============================================
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week TEXT NOT NULL,
  day_of_week INTEGER NOT NULL,
  meal_type TEXT NOT NULL,
  description TEXT NOT NULL,
  calories INTEGER,
  protein_g INTEGER,
  is_prepped BOOLEAN DEFAULT false,
  sort_order INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_meal_plans_week_day ON meal_plans(week, day_of_week, sort_order);

INSERT INTO settings (key, value) VALUES
  ('macro_targets', '{"calories": 2200, "protein_g": 190, "carbs_g": 200, "fat_g": 70, "deficit_note": "~500 below maintenance of ~2700-2800"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Week A template meals (breakfast/snacks same every day, dinner rotates)
INSERT INTO meal_plans (week, day_of_week, meal_type, description, calories, protein_g, is_prepped, sort_order) VALUES
  ('a', 0, 'breakfast', '4 eggs scrambled + 2 toast + butter. Black coffee.', 450, 35, false, 1),
  ('a', 0, 'am_snack', 'Greek yogurt (1 cup) + banana.', 200, 15, true, 2),
  ('a', 0, 'lunch', '6oz chicken thigh + 1 cup rice + steamed broccoli/veggies. Hot sauce.', 550, 45, true, 3),
  ('a', 0, 'pm_snack', 'Almonds + string cheese or hard-boiled egg.', 150, 12, true, 4),
  ('a', 0, 'dinner', 'Prep day — big batch high-protein chili (beef + 2 cans beans + tomatoes).', 600, 45, false, 5),
  ('a', 0, 'evening', 'Cottage cheese (1 cup) if needed for protein.', 200, 28, false, 6),
  ('a', 1, 'dinner', 'Chili bowl + cheese + Greek yogurt on top + rice.', 580, 48, true, 5),
  ('a', 2, 'dinner', 'Last chili portions over rice + side veggies.', 550, 45, true, 5),
  ('a', 3, 'dinner', 'Chicken stir fry: thigh strips + frozen veggies + soy sauce + rice.', 600, 50, false, 5),
  ('a', 4, 'dinner', 'Ground turkey tacos: seasoned turkey, tortillas, salsa, cheese. 3 tacos.', 580, 48, false, 5),
  ('a', 5, 'dinner', 'Sheet pan: sausage + potatoes + bell peppers. 400F, 25 min.', 550, 38, false, 5),
  ('a', 6, 'dinner', 'Flex: eat out ($15-20) OR breakfast for dinner (eggs, bacon, toast).', 600, 40, false, 5),
  -- Week B
  ('b', 0, 'breakfast', '4 eggs scrambled + 2 toast + butter. Black coffee.', 450, 35, false, 1),
  ('b', 0, 'am_snack', 'Greek yogurt (1 cup) + banana.', 200, 15, true, 2),
  ('b', 0, 'lunch', '6oz chicken thigh + 1 cup rice + steamed broccoli/veggies. Hot sauce.', 550, 45, true, 3),
  ('b', 0, 'pm_snack', 'Almonds + string cheese or hard-boiled egg.', 150, 12, true, 4),
  ('b', 0, 'dinner', 'Prep day — big pot chicken curry (thighs + coconut milk + veggies).', 600, 45, false, 5),
  ('b', 0, 'evening', 'Cottage cheese (1 cup) if needed for protein.', 200, 28, false, 6),
  ('b', 1, 'dinner', 'Curry over rice + side of steamed broccoli.', 580, 45, true, 5),
  ('b', 2, 'dinner', 'Last curry portions + naan or rice.', 560, 42, true, 5),
  ('b', 3, 'dinner', 'Beef + bean burritos: seasoned ground beef, beans, cheese, tortillas.', 620, 48, false, 5),
  ('b', 4, 'dinner', 'Quick ramen upgrade: instant noodles + 2 eggs + frozen veggies + soy sauce.', 500, 35, false, 5),
  ('b', 5, 'dinner', 'Baked chicken thighs + roasted potatoes + veggies.', 580, 48, false, 5),
  ('b', 6, 'dinner', 'Flex: eat out ($15-20) OR breakfast for dinner.', 600, 40, false, 5);

-- ============================================
-- GROCERY LIST
-- ============================================
CREATE TABLE grocery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  estimated_price DECIMAL(5,2),
  store TEXT,
  note TEXT,
  is_weekly BOOLEAN DEFAULT true,
  sort_order INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_grocery_category ON grocery_items(category, sort_order);

INSERT INTO grocery_items (category, name, estimated_price, store, note, is_weekly, sort_order) VALUES
  ('protein', 'Chicken thighs (3 lbs)', 5.99, 'GO', 'Main protein source', true, 1),
  ('protein', 'Ground beef 80/20 (2 lbs)', 7.49, 'GO', 'Chili, tacos, burritos', true, 2),
  ('protein', 'Eggs (18 ct)', 3.29, 'GO', '4/day target', true, 3),
  ('protein', 'Greek yogurt (32oz tub)', 4.49, 'TJ', 'AM snacks + chili topper', true, 4),
  ('protein', 'Cottage cheese (16oz)', 2.99, 'GO', 'Evening protein', true, 5),
  ('protein', 'Turkey sausage/patties', 3.49, 'GO', 'Week B breakfasts', true, 6),
  ('protein', 'Canned tuna (3 cans)', 2.97, 'GO', 'Emergency protein', true, 7),
  ('carbs', 'Jasmine rice (3 lb)', 3.99, 'TJ', NULL, true, 1),
  ('carbs', 'Oats (canister)', 2.99, 'TJ', 'Overnight oats option', false, 2),
  ('carbs', 'Whole wheat bread', 2.99, 'TJ', NULL, true, 3),
  ('carbs', 'Tortillas (10 ct)', 2.49, 'TJ', NULL, true, 4),
  ('produce', 'Bananas', 0.79, 'either', NULL, true, 1),
  ('produce', 'Broccoli (2 crowns)', 2.49, 'TJ', NULL, true, 2),
  ('produce', 'Bell peppers (3)', 2.49, 'either', NULL, true, 3),
  ('produce', 'Onions (3 lb bag)', 1.99, 'GO', NULL, false, 4),
  ('produce', 'Potatoes (5 lb)', 3.49, 'GO', NULL, true, 5),
  ('frozen_canned', 'Frozen stir fry veggies (3 bags)', 5.97, 'GO', 'Bulk up every meal', true, 1),
  ('frozen_canned', 'Canned black beans (3)', 2.67, 'GO', 'Cheap protein + fiber', true, 2),
  ('frozen_canned', 'Canned diced tomatoes (2)', 1.98, 'GO', NULL, true, 3),
  ('frozen_canned', 'Salsa / tomato sauce', 2.99, 'TJ', NULL, true, 4),
  ('staples', 'Shredded cheese', 2.99, 'TJ', NULL, true, 1),
  ('staples', 'Almonds (bag)', 3.99, 'TJ', 'Handful = snack', true, 2),
  ('staples', 'Soy sauce', 2.49, 'TJ', NULL, false, 3),
  ('staples', 'Olive oil', 3.99, 'TJ', NULL, false, 4),
  ('staples', 'Coffee beans (12oz)', 6.99, 'TJ', 'Every 2-3 weeks', false, 5);

-- ============================================
-- WORKOUT PROGRAM
-- ============================================
CREATE TABLE workout_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_name TEXT NOT NULL,
  day_label TEXT NOT NULL,
  color TEXT,
  sort_order INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_day_id UUID REFERENCES workout_days(id),
  name TEXT NOT NULL,
  sets_reps TEXT NOT NULL,
  note TEXT,
  is_back_friendly BOOLEAN DEFAULT true,
  sort_order INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO workout_days (day_name, day_label, color, sort_order) VALUES
  ('push', 'Day A: Push (Mon)', '#60a5fa', 1),
  ('pull', 'Day B: Pull (Wed)', '#34d399', 2),
  ('legs', 'Day C: Legs + Core (Fri)', '#a78bfa', 3);

INSERT INTO exercises (workout_day_id, name, sets_reps, note, sort_order) VALUES
  ((SELECT id FROM workout_days WHERE day_name = 'push'), 'Dumbbell Bench Press', '4x8-10', 'Neutral grip if shoulders tight', 1),
  ((SELECT id FROM workout_days WHERE day_name = 'push'), 'Overhead Press (seated)', '3x8-10', 'Seated to reduce spinal load', 2),
  ((SELECT id FROM workout_days WHERE day_name = 'push'), 'Incline DB Press', '3x10-12', NULL, 3),
  ((SELECT id FROM workout_days WHERE day_name = 'push'), 'Cable Lateral Raises', '3x12-15', NULL, 4),
  ((SELECT id FROM workout_days WHERE day_name = 'push'), 'Tricep Pushdowns', '3x12-15', NULL, 5),
  ((SELECT id FROM workout_days WHERE day_name = 'pull'), 'Lat Pulldowns', '4x8-10', 'Wide grip for width', 1),
  ((SELECT id FROM workout_days WHERE day_name = 'pull'), 'Seated Cable Row', '4x10-12', 'Back neutral — great for posture', 2),
  ((SELECT id FROM workout_days WHERE day_name = 'pull'), 'Face Pulls', '3x15-20', 'Shoulder health essential', 3),
  ((SELECT id FROM workout_days WHERE day_name = 'pull'), 'DB Bicep Curls', '3x10-12', NULL, 4),
  ((SELECT id FROM workout_days WHERE day_name = 'pull'), 'Hammer Curls', '3x10-12', NULL, 5),
  ((SELECT id FROM workout_days WHERE day_name = 'legs'), 'Leg Press', '4x10-12', 'Heavy compound, zero spinal load', 1),
  ((SELECT id FROM workout_days WHERE day_name = 'legs'), 'Romanian Deadlift (light)', '3x10-12', 'Light, stretch hamstrings. Skip if back flares.', 2),
  ((SELECT id FROM workout_days WHERE day_name = 'legs'), 'Leg Curls', '3x12-15', NULL, 3),
  ((SELECT id FROM workout_days WHERE day_name = 'legs'), 'Leg Extensions', '3x12-15', NULL, 4),
  ((SELECT id FROM workout_days WHERE day_name = 'legs'), 'Plank + Dead Bug', '3x30s + 10/side', 'Core stability for back health', 5);

CREATE TABLE daily_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_name TEXT NOT NULL,
  label TEXT NOT NULL,
  exercises JSONB NOT NULL,
  sort_order INTEGER NOT NULL
);

INSERT INTO daily_protocols (protocol_name, label, exercises, sort_order) VALUES
  ('back_health_morning', 'Morning Back Protocol (5 min)', '[{"name": "Cat-cow stretches", "reps": "10 reps"}, {"name": "Knee-to-chest hold", "reps": "30s each side"}, {"name": "Bird-dog", "reps": "10 each side"}]', 1),
  ('back_health_pre_gym', 'Pre-Gym Warm-Up', '[{"name": "Treadmill walk", "reps": "5 min"}, {"name": "Hip circles", "reps": "10 each direction"}, {"name": "Glute bridges", "reps": "2x15"}]', 2);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON schedule_blocks FOR ALL USING (true);
CREATE POLICY "service_role_all" ON meal_plans FOR ALL USING (true);
CREATE POLICY "service_role_all" ON grocery_items FOR ALL USING (true);
CREATE POLICY "service_role_all" ON workout_days FOR ALL USING (true);
CREATE POLICY "service_role_all" ON exercises FOR ALL USING (true);
CREATE POLICY "service_role_all" ON daily_protocols FOR ALL USING (true);

CREATE POLICY "anon_read" ON schedule_blocks FOR SELECT USING (true);
CREATE POLICY "anon_read" ON meal_plans FOR SELECT USING (true);
CREATE POLICY "anon_read" ON grocery_items FOR SELECT USING (true);
CREATE POLICY "anon_read" ON workout_days FOR SELECT USING (true);
CREATE POLICY "anon_read" ON exercises FOR SELECT USING (true);
CREATE POLICY "anon_read" ON daily_protocols FOR SELECT USING (true);
