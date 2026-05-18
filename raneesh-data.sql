-- ============================================================
-- RANEESH'S REAL DATA
-- User ID: 404514bc-d2b6-4101-bca9-5cf0e13b31c6
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. USER PROFILE
INSERT INTO user_profiles (user_id, yearly_income_aed, yearly_income_inr, monthly_takehome_aed, risk_tolerance, created_at, updated_at)
VALUES (
  '404514bc-d2b6-4101-bca9-5cf0e13b31c6',
  NULL,
  NULL,
  NULL,
  'moderate',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  risk_tolerance = EXCLUDED.risk_tolerance,
  updated_at = NOW();

-- 2. GOALS
INSERT INTO goals (id, user_id, name, target_amount, currency, target_date, is_primary, notes, created_at) VALUES

('80605558-94dd-40de-b198-363fa7d7843c', '404514bc-d2b6-4101-bca9-5cf0e13b31c6',
 'Financial Freedom', 10000000, 'INR', '2037-12-31', true,
 NULL, NOW()),

('46e8d782-1045-4dc8-bdbb-02a90d0d5e53', '404514bc-d2b6-4101-bca9-5cf0e13b31c6',
 'Nithara''s Study', 5000000, 'INR', '2035-02-03', false,
 NULL, NOW())

ON CONFLICT (id) DO NOTHING;

-- 3. INVESTMENTS
INSERT INTO investments (id, user_id, goal_id, platform, type, invested_amount, current_value, currency, month, notes, created_at) VALUES

('d823a9d0-a6bf-4409-a227-0b334e52549b', '404514bc-d2b6-4101-bca9-5cf0e13b31c6',
 '80605558-94dd-40de-b198-363fa7d7843c',
 'IIFL', 'Mutual Fund', 1594920, 1794417, 'INR', '2025-12-01',
 NULL, NOW()),

('225c7fc3-7e7d-428e-8c33-ab705be2c107', '404514bc-d2b6-4101-bca9-5cf0e13b31c6',
 '46e8d782-1045-4dc8-bdbb-02a90d0d5e53',
 'Upstock - Priya', 'Mutual Fund', 163351, 163351, 'INR', '2025-12-01',
 NULL, NOW()),

('78dffbfd-05b2-404c-8fc8-a44290967867', '404514bc-d2b6-4101-bca9-5cf0e13b31c6',
 '46e8d782-1045-4dc8-bdbb-02a90d0d5e53',
 'Upstock - Remani', 'Mutual Fund', 103378, 177500, 'INR', '2025-12-01',
 NULL, NOW()),

('1dc1ceb1-e33b-4501-bb33-57f3e8e4964b', '404514bc-d2b6-4101-bca9-5cf0e13b31c6',
 '80605558-94dd-40de-b198-363fa7d7843c',
 'Pentad', 'Mutual Fund', 600000, 671373, 'INR', '2025-12-01',
 NULL, NOW()),

('ce90b2c8-be2e-4914-83ed-ed84729acadc', '404514bc-d2b6-4101-bca9-5cf0e13b31c6',
 '80605558-94dd-40de-b198-363fa7d7843c',
 'IIFL', 'F&O', 1020223, 1020223, 'INR', '2025-12-01',
 NULL, NOW())

ON CONFLICT (id) DO NOTHING;
