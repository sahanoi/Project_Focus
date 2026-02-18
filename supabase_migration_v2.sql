-- Add missing columns to habits table for full app support
-- Run this in Supabase SQL Editor

-- Habit metadata columns
ALTER TABLE habits ADD COLUMN IF NOT EXISTS type text DEFAULT 'regular';
ALTER TABLE habits ADD COLUMN IF NOT EXISTS color text DEFAULT '#2563EB';
ALTER TABLE habits ADD COLUMN IF NOT EXISTS icon text DEFAULT '✅';
ALTER TABLE habits ADD COLUMN IF NOT EXISTS difficulty text;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS daily_target integer;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS goal_value integer;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS unit text;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS end_date date;

-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'admin'));
