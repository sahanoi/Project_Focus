-- ==============================================
-- Focus FTP — Supabase Schema (matches live DB)
-- ==============================================

-- Profiles table (stats stored as JSONB)
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text,
  avatar_url text,
  updated_at timestamp with time zone,
  stats jsonb DEFAULT '{"xp": 0, "level": 1, "attributes": {"bal": 60, "dsc": 60, "foc": 60, "grt": 60, "ovr": 60, "stk": 60, "vit": 60}, "nextLevelXp": 1000}'::jsonb,
  role text DEFAULT 'user'::text CHECK (role = ANY (ARRAY['user'::text, 'admin'::text])),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- Habits table
CREATE TABLE public.habits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  schedule jsonb NOT NULL DEFAULT '{"type": "daily"}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  archived boolean DEFAULT false,
  type text DEFAULT 'regular'::text,
  color text DEFAULT '#2563EB'::text,
  icon text DEFAULT '✅'::text,
  difficulty text,
  daily_target integer,
  goal_value integer,
  unit text,
  start_date date,
  end_date date,
  CONSTRAINT habits_pkey PRIMARY KEY (id),
  CONSTRAINT habits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Habit Completions table
CREATE TABLE public.habit_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  habit_id uuid,
  completed_date date NOT NULL,
  value integer,
  completed boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT habit_completions_pkey PRIMARY KEY (id),
  CONSTRAINT habit_completions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT habit_completions_habit_id_fkey FOREIGN KEY (habit_id) REFERENCES public.habits(id)
);

-- Goals table
CREATE TABLE public.goals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  habit_id uuid,
  description text NOT NULL,
  target_value integer NOT NULL,
  current_value integer DEFAULT 0,
  deadline date,
  achieved boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT goals_pkey PRIMARY KEY (id),
  CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT goals_habit_id_fkey FOREIGN KEY (habit_id) REFERENCES public.habits(id)
);

-- Routines table
CREATE TABLE public.routines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  time_of_day text NOT NULL,
  habit_ids uuid[] DEFAULT '{}'::uuid[],
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT routines_pkey PRIMARY KEY (id),
  CONSTRAINT routines_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- ==============================================
-- RLS Policies
-- ==============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Habits
CREATE POLICY "Users can view own habits" ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON public.habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON public.habits FOR DELETE USING (auth.uid() = user_id);

-- Completions
CREATE POLICY "Users can view own completions" ON public.habit_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON public.habit_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own completions" ON public.habit_completions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own completions" ON public.habit_completions FOR DELETE USING (auth.uid() = user_id);

-- Goals
CREATE POLICY "Users can view own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- Routines
CREATE POLICY "Users can view own routines" ON public.routines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own routines" ON public.routines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own routines" ON public.routines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own routines" ON public.routines FOR DELETE USING (auth.uid() = user_id);

-- Trigger: auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, updated_at)
  VALUES (new.id, new.raw_user_meta_data->>'username', now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
