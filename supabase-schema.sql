-- Financial Freedom Portal - Supabase Schema
-- Run this entire file in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (manually managed - no Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  name TEXT DEFAULT 'User',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (income, game settings)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  yearly_income_aed DECIMAL DEFAULT 0,
  yearly_income_inr DECIMAL DEFAULT 0,
  monthly_takehome_aed DECIMAL DEFAULT 0,
  income_source TEXT DEFAULT 'salary',
  risk_tolerance TEXT DEFAULT 'medium',
  time_horizon TEXT DEFAULT 'long',
  primary_motivation TEXT DEFAULT 'freedom',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'AED',
  target_date DATE,
  notes TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal history (edit log)
CREATE TABLE IF NOT EXISTS goal_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  changed_field TEXT,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investments
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  type TEXT NOT NULL,
  invested_amount DECIMAL NOT NULL,
  current_value DECIMAL NOT NULL,
  currency TEXT DEFAULT 'AED',
  month DATE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'AED',
  due_date DATE,
  category TEXT DEFAULT 'Other',
  payment_type TEXT DEFAULT 'essential',
  status TEXT DEFAULT 'due',
  is_recurring BOOLEAN DEFAULT FALSE,
  icon TEXT DEFAULT '💳',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Analysis cache
CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  analysis_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Psychology / Money Mind progress
CREATE TABLE IF NOT EXISTS psychology_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trap_number INTEGER NOT NULL,
  status TEXT DEFAULT 'aware',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, trap_number)
);

-- Exchange rates cache
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate DECIMAL NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS (small personal app, direct credential management)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE goal_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE investments DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses DISABLE ROW LEVEL SECURITY;
ALTER TABLE psychology_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates DISABLE ROW LEVEL SECURITY;

-- Insert your first user (change password_hash after running: bcryptjs hash of your password)
-- To generate a hash, use: https://bcrypt-generator.com/ (12 rounds)
-- Example: password "Freedom@2024" hashed below (CHANGE THIS)
-- INSERT INTO users (username, password_hash, email, name)
-- VALUES ('raneesh', '$2a$12$YOUR_HASH_HERE', 'raneesh.mr08@gmail.com', 'Raneesh');

-- Storage bucket for goal images (run in Supabase Storage UI)
-- Create a public bucket named: goal-images
