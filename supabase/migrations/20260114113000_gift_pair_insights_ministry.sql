-- Gift/Ministry insights storage for richer, de-biased reports

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Helpers
create or replace function public.generate_pair_key(gift_a public.gift_key, gift_b public.gift_key)
returns text
language sql
immutable
as $$
  select case
    when gift_a <= gift_b then gift_a || '_' || gift_b
    else gift_b || '_' || gift_a
  end;
$$;

-- Gift pair insights
create table if not exists public.gift_pair_insights (
  id uuid primary key default gen_random_uuid(),
  gift_a public.gift_key not null,
  gift_b public.gift_key not null,
  pair_key text generated always as (public.generate_pair_key(gift_a, gift_b)) stored,
  synergy_score numeric default 0 check (synergy_score between 0 and 100),
  summary text,
  strengths jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  mitigations jsonb not null default '[]'::jsonb,
  examples jsonb not null default '[]'::jsonb,
  language text not null default 'pt',
  version integer not null default 1,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists gift_pair_insights_pair_lang_version_idx
  on public.gift_pair_insights (pair_key, language, version desc);

-- Ministry recommendations
create table if not exists public.ministry_recommendations (
  id uuid primary key default gen_random_uuid(),
  ministry_key text not null,
  ministry_name text not null,
  description text,
  gifts_match jsonb not null default '[]'::jsonb,
  fit_score numeric default 0 check (fit_score between 0 and 100),
  why_fit text,
  responsibilities jsonb not null default '[]'::jsonb,
  success_metrics jsonb not null default '[]'::jsonb,
  growth_areas jsonb not null default '[]'::jsonb,
  spiritual_practices jsonb not null default '[]'::jsonb,
  language text not null default 'pt',
  version integer not null default 1,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ministry_recommendations_key_lang_idx
  on public.ministry_recommendations (ministry_key, language, version desc);

-- Version tracking (optional metadata)
create table if not exists public.content_versions (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  language text not null default 'pt',
  version integer not null,
  notes text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create unique index if not exists content_versions_unique_idx
  on public.content_versions (content_type, language, version);

-- RLS
alter table public.gift_pair_insights enable row level security;
alter table public.ministry_recommendations enable row level security;
alter table public.content_versions enable row level security;

-- Read policies (allow anon/authenticated; writes only via service role)
create policy gift_pair_insights_select_authenticated
  on public.gift_pair_insights
  for select
  using (auth.role() in ('authenticated', 'anon', 'service_role'));

create policy ministry_recommendations_select_authenticated
  on public.ministry_recommendations
  for select
  using (auth.role() in ('authenticated', 'anon', 'service_role'));

create policy content_versions_select_authenticated
  on public.content_versions
  for select
  using (auth.role() in ('authenticated', 'anon', 'service_role'));

create policy gift_pair_insights_write_service
  on public.gift_pair_insights
  for all
  using (auth.role() = 'service_role')
  with check (true);

create policy ministry_recommendations_write_service
  on public.ministry_recommendations
  for all
  using (auth.role() = 'service_role')
  with check (true);

create policy content_versions_write_service
  on public.content_versions
  for all
  using (auth.role() = 'service_role')
  with check (true);
