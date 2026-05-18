-- ============================================================
-- DEMO DATA for "wealth" user
-- User ID: b79e2929-6180-4b09-a6f5-ab25d3373f10
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. USER PROFILE
INSERT INTO user_profiles (user_id, yearly_income_aed, yearly_income_inr, monthly_takehome_aed, risk_tolerance, created_at, updated_at)
VALUES (
  'b79e2929-6180-4b09-a6f5-ab25d3373f10',
  264000,
  NULL,
  18500,
  'moderate',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  yearly_income_aed = EXCLUDED.yearly_income_aed,
  monthly_takehome_aed = EXCLUDED.monthly_takehome_aed,
  risk_tolerance = EXCLUDED.risk_tolerance;

-- 2. GOALS
INSERT INTO goals (id, user_id, name, target_amount, currency, target_date, is_primary, notes, created_at) VALUES

-- Primary goal
('a1000001-0000-0000-0000-000000000001', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'Financial Freedom by 45', 3000000, 'AED', '2035-01-01', true,
 'Total corpus needed to retire early and live on investment returns alone.', NOW()),

-- Secondary goals
('a1000001-0000-0000-0000-000000000002', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'Dream Home — Dubai Hills', 800000, 'AED', '2028-06-01', false,
 '20% down payment on a 2BHK villa in Dubai Hills Estate.', NOW()),

('a1000001-0000-0000-0000-000000000003', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'Children Education Fund', 5000000, 'INR', '2032-08-01', false,
 'Full university fund for 2 kids — India or abroad.', NOW()),

('a1000001-0000-0000-0000-000000000004', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'Emergency Buffer — 6 Months', 111000, 'AED', '2026-12-31', false,
 '6x monthly expenses fully liquid in savings account.', NOW()),

('a1000001-0000-0000-0000-000000000005', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'India Trip — Family Vacation', 180000, 'INR', '2026-10-01', false,
 'Annual Kerala trip + Goa extension. Book by August.', NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. INVESTMENTS
INSERT INTO investments (id, user_id, goal_id, platform, type, invested_amount, current_value, currency, month, notes, created_at) VALUES

-- Linked to primary goal (Financial Freedom)
('b2000001-0000-0000-0000-000000000001', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'a1000001-0000-0000-0000-000000000001',
 'HDFC Mutual Fund', 'Mutual Fund', 1850000, 2340000, 'INR', '2021-04-01',
 'Flexi Cap + Mid Cap funds via SIP ₹45,000/month since 2021.', NOW()),

('b2000001-0000-0000-0000-000000000002', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'a1000001-0000-0000-0000-000000000001',
 'Zerodha', 'Stocks', 420000, 610000, 'INR', '2022-01-01',
 'Direct equity — Nifty 50 large caps. Buy and hold strategy.', NOW()),

('b2000001-0000-0000-0000-000000000003', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'a1000001-0000-0000-0000-000000000001',
 'Emirates NBD Savings', 'Fixed Deposit', 55000, 58200, 'AED', '2023-06-01',
 'AED FD at 4.2% p.a. — 18 month tenure.', NOW()),

('b2000001-0000-0000-0000-000000000004', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'a1000001-0000-0000-0000-000000000001',
 'Sarwa', 'ETF Portfolio', 38000, 44500, 'AED', '2023-01-01',
 'Aggressive robo-advisor portfolio. Monthly AED 2,000 auto-invest.', NOW()),

-- Linked to Dubai Home goal
('b2000001-0000-0000-0000-000000000005', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'a1000001-0000-0000-0000-000000000002',
 'ADCB Goal Saver', 'Savings', 120000, 124800, 'AED', '2024-01-01',
 'Dedicated home down payment account. AED 5,000/month.', NOW()),

-- Linked to Children Education Fund
('b2000001-0000-0000-0000-000000000006', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'a1000001-0000-0000-0000-000000000003',
 'SBI Mutual Fund', 'Mutual Fund', 960000, 1180000, 'INR', '2020-08-01',
 'Children education fund — ELSS + Balanced Advantage. SIP ₹20,000/month.', NOW()),

-- Linked to Emergency Buffer
('b2000001-0000-0000-0000-000000000007', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'a1000001-0000-0000-0000-000000000004',
 'FAB Current Account', 'Savings', 78000, 78000, 'AED', '2025-01-01',
 'Liquid emergency fund — zero lock-in.', NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. PAYMENTS
INSERT INTO payments (id, user_id, name, amount, currency, category, payment_type, status, due_date, icon, created_at) VALUES

-- Essential
('c3000001-0000-0000-0000-000000000001', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'Dubai Hills Rent', 7800, 'AED', 'Housing', 'essential', 'pending',
 '2026-06-01', '🏠', NOW()),

('c3000001-0000-0000-0000-000000000002', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'DEWA Bill', 420, 'AED', 'Utilities', 'essential', 'paid',
 '2026-05-15', '💡', NOW()),

('c3000001-0000-0000-0000-000000000003', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'School Fees — Term 3', 18500, 'AED', 'Education', 'essential', 'pending',
 '2026-06-10', '🎓', NOW()),

('c3000001-0000-0000-0000-000000000004', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'India SIP (₹65,000)', 2486, 'AED', 'Investment', 'essential', 'pending',
 '2026-06-05', '📈', NOW()),

('c3000001-0000-0000-0000-000000000005', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'Sarwa Auto-Invest', 2000, 'AED', 'Investment', 'essential', 'pending',
 '2026-06-01', '🤖', NOW()),

('c3000001-0000-0000-0000-000000000006', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'Home Down Payment SIP', 5000, 'AED', 'Investment', 'essential', 'pending',
 '2026-06-01', '🏡', NOW()),

('c3000001-0000-0000-0000-000000000007', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'Health Insurance Premium', 680, 'AED', 'Insurance', 'essential', 'paid',
 '2026-05-10', '🏥', NOW()),

('c3000001-0000-0000-0000-000000000008', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'Car Loan EMI', 1850, 'AED', 'Transport', 'essential', 'paid',
 '2026-05-20', '🚗', NOW()),

-- Discretionary
('c3000001-0000-0000-0000-000000000009', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'Netflix + Spotify', 98, 'AED', 'Entertainment', 'discretionary', 'paid',
 '2026-05-12', '🎬', NOW()),

('c3000001-0000-0000-0000-000000000010', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'Gym Membership', 280, 'AED', 'Health', 'discretionary', 'paid',
 '2026-05-01', '💪', NOW()),

('c3000001-0000-0000-0000-000000000011', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'Dining Out Budget', 1200, 'AED', 'Food', 'discretionary', 'pending',
 '2026-06-30', '🍽️', NOW()),

('c3000001-0000-0000-0000-000000000012', 'b79e2929-6180-4b09-a6f5-ab25d3373f10',
 'Amazon / Online Shopping', 650, 'AED', 'Shopping', 'discretionary', 'pending',
 '2026-06-30', '📦', NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. PSYCHOLOGY PROGRESS (a mix of statuses to show progress)
INSERT INTO psychology_progress (user_id, trap_number, status, updated_at) VALUES
('b79e2929-6180-4b09-a6f5-ab25d3373f10', 1,  'mastered',  NOW()),
('b79e2929-6180-4b09-a6f5-ab25d3373f10', 2,  'working',   NOW()),
('b79e2929-6180-4b09-a6f5-ab25d3373f10', 3,  'mastered',  NOW()),
('b79e2929-6180-4b09-a6f5-ab25d3373f10', 4,  'aware',     NOW()),
('b79e2929-6180-4b09-a6f5-ab25d3373f10', 5,  'mastered',  NOW()),
('b79e2929-6180-4b09-a6f5-ab25d3373f10', 6,  'mastered',  NOW()),
('b79e2929-6180-4b09-a6f5-ab25d3373f10', 7,  'working',   NOW()),
('b79e2929-6180-4b09-a6f5-ab25d3373f10', 8,  'aware',     NOW()),
('b79e2929-6180-4b09-a6f5-ab25d3373f10', 9,  'working',   NOW()),
('b79e2929-6180-4b09-a6f5-ab25d3373f10', 10, 'mastered',  NOW()),
('b79e2929-6180-4b09-a6f5-ab25d3373f10', 11, 'aware',     NOW()),
('b79e2929-6180-4b09-a6f5-ab25d3373f10', 12, 'working',   NOW()),
('b79e2929-6180-4b09-a6f5-ab25d3373f10', 13, 'mastered',  NOW()),
('b79e2929-6180-4b09-a6f5-ab25d3373f10', 14, 'aware',     NOW()),
('b79e2929-6180-4b09-a6f5-ab25d3373f10', 15, 'working',   NOW())
ON CONFLICT (user_id, trap_number) DO UPDATE SET status = EXCLUDED.status, updated_at = NOW();

-- 6. EXCHANGE RATE (force accurate current rate)
INSERT INTO exchange_rates (from_currency, to_currency, rate, fetched_at)
VALUES ('AED', 'INR', 26.13, NOW());
