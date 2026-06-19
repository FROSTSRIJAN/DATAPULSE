-- ============================================================
-- XENO DataPulse AI — Supabase Database Schema
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  email        text unique,
  avatar_url   text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── analyses ─────────────────────────────────────────────────
create table if not exists public.analyses (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid references auth.users(id) on delete cascade not null,
  dataset_name          text not null,
  dataset_type          text,
  detection_confidence  integer,
  trust_score           integer,
  crm_readiness         integer,
  marketing_readiness   integer,
  analytics_readiness   integer,
  operations_readiness  integer,
  total_rows            integer,
  clean_rows            integer,
  total_issues          integer,
  error_breakdown       jsonb,
  column_mappings       jsonb,
  created_at            timestamptz default now()
);

-- ── analysis_reports ─────────────────────────────────────────
create table if not exists public.analysis_reports (
  id                uuid primary key default uuid_generate_v4(),
  analysis_id       uuid references public.analyses(id) on delete cascade not null,
  executive_summary text,
  key_findings      jsonb,
  business_risks    jsonb,
  recommendations   jsonb,
  risk_level        text,
  data_readiness    text,
  created_at        timestamptz default now()
);

-- ── country_rules ─────────────────────────────────────────────
create table if not exists public.country_rules (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  country_code text not null,
  country_name text not null,
  dial_code    text,
  digits       integer[],
  example      text,
  created_at   timestamptz default now(),
  unique(user_id, country_code)
);

-- ── Row Level Security ────────────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.analyses          enable row level security;
alter table public.analysis_reports  enable row level security;
alter table public.country_rules     enable row level security;

-- Profiles: own row only
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id);

-- Analyses: own rows only
create policy "analyses_own" on public.analyses
  for all using (auth.uid() = user_id);

-- Analysis reports: via analysis ownership
create policy "reports_via_analysis" on public.analysis_reports
  for all using (
    exists (
      select 1 from public.analyses a
      where a.id = analysis_id and a.user_id = auth.uid()
    )
  );

-- Country rules: own rows only
create policy "rules_own" on public.country_rules
  for all using (auth.uid() = user_id);

-- ── Indexes ───────────────────────────────────────────────────
create index if not exists analyses_user_id_idx    on public.analyses(user_id);
create index if not exists analyses_created_at_idx on public.analyses(created_at desc);
create index if not exists reports_analysis_id_idx on public.analysis_reports(analysis_id);
