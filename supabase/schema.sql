-- ARK Tracker — schema Supabase
-- Cole isso no SQL Editor do seu projeto Supabase e rode uma vez.

create extension if not exists "pgcrypto";

-- 1) GENÉTICA: cada linha de dino (espécie + apelido/linhagem + sexo)
--    guarda o registro atual e o histórico de gerações anteriores.
create table if not exists dino_lines (
  id uuid primary key default gen_random_uuid(),
  species text not null,
  tag text not null,           -- ex: "Linhagem A", "Casal Principal"
  sex text not null check (sex in ('M', 'F')),
  created_at timestamptz not null default now()
);

create table if not exists dino_stats (
  id uuid primary key default gen_random_uuid(),
  line_id uuid not null references dino_lines(id) on delete cascade,
  hp numeric,
  stamina numeric,
  oxygen numeric,
  food numeric,
  weight numeric,
  melee numeric,
  speed numeric,
  mutations_count integer not null default 0,
  notes text,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_dino_stats_line on dino_stats(line_id);
create index if not exists idx_dino_stats_current on dino_stats(line_id, is_current);

-- 2) PLANTEL / CHECKLIST: o que você tem e o que está faltando
create table if not exists roster (
  id uuid primary key default gen_random_uuid(),
  species text not null,
  sex text not null check (sex in ('M', 'F')),
  status text not null default 'need' check (status in ('have', 'need', 'pair_complete', 'breeding')),
  notes text,
  created_at timestamptz not null default now()
);

-- 3) TIMERS DE BREEDING
create table if not exists breed_timers (
  id uuid primary key default gen_random_uuid(),
  species text not null,
  label text,
  ends_at timestamptz not null,
  notified boolean not null default false,
  qstash_message_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_breed_timers_ends_at on breed_timers(ends_at);
