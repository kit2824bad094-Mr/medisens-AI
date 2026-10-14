-- ====================================================================
-- MediSens AI - Clinician Profiles & Role-Based Security Schema
-- Paste this script into your Supabase Dashboard -> SQL Editor and run it.
-- ====================================================================

-- 1. Create profiles table linked to Supabase Auth users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text not null,
  email text not null,
  role text not null default 'doctor' check (role in ('doctor', 'patient')),
  specialization text default 'General Medicine',
  license_number text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. RLS Security Policies
-- Policy: Doctors and users can view their own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

-- Policy: Users can insert their own profile upon registration
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Policy: Users can update their own profile
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 4. Automatic User Profile Synchronization Trigger
-- When a user registers via Supabase Auth (Email or Google OAuth),
-- this trigger automatically provisions a clinician profile record.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role, specialization, license_number, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Dr. Clinician'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'doctor'),
    coalesce(new.raw_user_meta_data->>'specialization', 'General Medicine'),
    new.raw_user_meta_data->>'license_number',
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    email = excluded.email,
    role = coalesce(profiles.role, excluded.role),
    updated_at = timezone('utc'::text, now());

  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution on every new auth signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
