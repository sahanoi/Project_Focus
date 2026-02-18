-- Create tables for the Habit Tracker

-- 1. PROFILES (Extends Auth)
create table profiles (
  id uuid references auth.users not null primary key,
  username text,
  avatar_url text,
  updated_at timestamp with time zone,
  stats jsonb default '{"level": 1, "xp": 0, "nextLevelXp": 1000, "attributes": {"ovr": 60, "dsc": 60, "foc": 60, "stk": 60, "bal": 60, "grt": 60, "vit": 60}}'::jsonb
);

alter table profiles enable row level security;

create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);

-- 2. HABITS
create table habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  category text not null,
  schedule jsonb not null default '{"type": "daily"}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  archived boolean default false
);

alter table habits enable row level security;

create policy "Users can crud their own habits" on habits
  for all using (auth.uid() = user_id);

-- 3. GOALS
create table goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  habit_id uuid references habits(id) on delete cascade,
  description text not null,
  target_value integer not null,
  current_value integer default 0,
  deadline date,
  achieved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table goals enable row level security;

create policy "Users can crud their own goals" on goals
  for all using (auth.uid() = user_id);

-- 4. ROUTINES
create table routines (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  time_of_day text not null, -- 'morning', 'afternoon', 'evening'
  habit_ids uuid[] default '{}'::uuid[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table routines enable row level security;

create policy "Users can crud their own routines" on routines
  for all using (auth.uid() = user_id);

-- 5. COMPLETIONS (Storing habit completion data)
-- Storing as individual records is better for SQL than a JSON blob on the habit
create table habit_completions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  habit_id uuid references habits(id) on delete cascade,
  completed_date date not null,
  value integer, -- For numerical habits
  completed boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(habit_id, completed_date)
);

alter table habit_completions enable row level security;

create policy "Users can crud their own completions" on habit_completions
  for all using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
