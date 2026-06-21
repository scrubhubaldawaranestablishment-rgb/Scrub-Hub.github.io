-- StyleMirror initial schema for project dilknptetrnicoilhfmb

create extension if not exists "pgcrypto";

create table if not exists countries (
  code text primary key,
  name text not null,
  flag text not null,
  region text not null,
  created_at timestamptz not null default now()
);

create table if not exists brands (
  id text primary key,
  name text not null,
  country_code text not null references countries (code) on delete cascade,
  category text not null check (
    category in ('luxury', 'premium', 'streetwear', 'traditional', 'modest', 'sportswear')
  ),
  description text not null,
  why_buy text not null,
  price_range text not null check (price_range in ('$', '$$', '$$$', '$$$$')),
  trending boolean not null default false,
  website text,
  outfit_style text not null,
  color_palette text[] not null default '{}',
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists brands_country_code_idx on brands (country_code);
create index if not exists brands_trending_idx on brands (trending) where trending = true;

create table if not exists country_trends (
  id bigint generated always as identity primary key,
  country_code text not null references countries (code) on delete cascade,
  trend text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists country_trends_country_code_idx on country_trends (country_code);

create table if not exists generation_sessions (
  id uuid primary key default gen_random_uuid(),
  country_code text not null,
  analysis jsonb not null,
  recommendations jsonb not null,
  mode text not null check (mode in ('ai', 'demo')),
  created_at timestamptz not null default now()
);

create index if not exists generation_sessions_country_code_idx on generation_sessions (country_code);
create index if not exists generation_sessions_created_at_idx on generation_sessions (created_at desc);

alter table countries enable row level security;
alter table brands enable row level security;
alter table country_trends enable row level security;
alter table generation_sessions enable row level security;

create policy "Public read countries"
  on countries for select
  to anon, authenticated
  using (true);

create policy "Public read brands"
  on brands for select
  to anon, authenticated
  using (true);

create policy "Public read country trends"
  on country_trends for select
  to anon, authenticated
  using (true);

create policy "Service role manages generation sessions"
  on generation_sessions for all
  to service_role
  using (true)
  with check (true);
