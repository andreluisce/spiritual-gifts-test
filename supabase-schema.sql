-- =========================================================
-- Spiritual Gifts Quiz – Full Schema (Supabase/Postgres)
-- Idempotent & safe to re-run
-- =========================================================

-- ---------- Extensions ----------
create extension if not exists pgcrypto with schema public;
create extension if not exists pgjwt with schema public;

-- ---------- Enum: gift_key ----------
do $$
begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                 where t.typname = 'gift_key' and n.nspname = 'public') then
    create type public.gift_key as enum (
      'A_PROPHECY',
      'B_SERVICE',
      'C_TEACHING',
      'D_EXHORTATION',
      'E_GIVING',
      'F_LEADERSHIP',
      'G_MERCY',
      'H_EVANGELISM',
      'I_PASTOR'
    );
  end if;
end$$;

-- ---------- Helper: updated_at trigger ----------
create or replace function public.trigger_set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end$$;

-- =========================================================
-- PROFILES
-- =========================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default timezone('utc', now()),
  updated_at  timestamptz not null default timezone('utc', now())
);

-- updated_at trigger
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'profiles_set_timestamp'
  ) then
    create trigger profiles_set_timestamp
      before update on public.profiles
      for each row
      execute function public.trigger_set_timestamp();
  end if;
end$$;

-- RLS
alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='profiles' and policyname='profiles_select_own'
  ) then
    create policy profiles_select_own
      on public.profiles
      for select
      using (id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='profiles' and policyname='profiles_update_own'
  ) then
    create policy profiles_update_own
      on public.profiles
      for update
      using (id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='profiles' and policyname='profiles_insert_self'
  ) then
    create policy profiles_insert_self
      on public.profiles
      for insert
      with check (id = auth.uid());
  end if;
end$$;

-- Optional: auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict do nothing;
  return new;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'on_auth_user_created'
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row
      execute function public.handle_new_user();
  end if;
end$$;

-- =========================================================
-- GIFTS
-- =========================================================
create table if not exists public.gifts (
  key         public.gift_key primary key,
  name        text not null,
  description text
);

-- Seed gifts (idempotente)
insert into public.gifts (key, name, description) values
  ('A_PROPHECY'::public.gift_key,   'Prophecy',    'Proclaim truth with clarity and conviction'),
  ('B_SERVICE'::public.gift_key,    'Service',     'Practical support and helps'),
  ('C_TEACHING'::public.gift_key,   'Teaching',    'Explain truth faithfully and clearly'),
  ('D_EXHORTATION'::public.gift_key,'Exhortation', 'Encourage and counsel toward action'),
  ('E_GIVING'::public.gift_key,     'Giving',      'Share resources generously'),
  ('F_LEADERSHIP'::public.gift_key, 'Leadership',  'Organize and guide toward goals'),
  ('G_MERCY'::public.gift_key,      'Mercy',       'Care for the hurting and overlooked'),
  ('H_EVANGELISM'::public.gift_key, 'Evangelism',  'Share the gospel effectively'),
  ('I_PASTOR'::public.gift_key,     'Pastor',      'Shepherd and care for people')
on conflict (key) do nothing;

-- =========================================================
-- QUESTIONS (1..45)
-- =========================================================
create table if not exists public.questions (
  id    smallint primary key check (id between 1 and 45),
  text  text not null
);

-- Seed minimal texts (coloquei títulos curtos; você pode atualizar depois)
do $$
declare
  i int;
begin
  for i in 1..45 loop
    insert into public.questions (id, text)
    values (i, format('Question %s placeholder', i))
    on conflict (id) do nothing;
  end loop;
end$$;

-- =========================================================
-- QUESTION → GIFT MAP (conforme o PDF: blocos de 5 por letra A..I)
-- A: 1,10,19,28,37 | B: 2,11,20,29,38 | ... | I: 9,18,27,36,45
-- =========================================================
create table if not exists public.question_gift_map (
  question_id smallint primary key references public.questions(id) on delete cascade,
  gift        public.gift_key not null
);

-- Seed mapping idempotente
do $$
begin
  -- A
  insert into public.question_gift_map(question_id, gift) values
    (1,'A_PROPHECY'), (10,'A_PROPHECY'), (19,'A_PROPHECY'), (28,'A_PROPHECY'), (37,'A_PROPHECY')
  on conflict (question_id) do nothing;

  -- B
  insert into public.question_gift_map(question_id, gift) values
    (2,'B_SERVICE'), (11,'B_SERVICE'), (20,'B_SERVICE'), (29,'B_SERVICE'), (38,'B_SERVICE')
  on conflict (question_id) do nothing;

  -- C
  insert into public.question_gift_map(question_id, gift) values
    (3,'C_TEACHING'), (12,'C_TEACHING'), (21,'C_TEACHING'), (30,'C_TEACHING'), (39,'C_TEACHING')
  on conflict (question_id) do nothing;

  -- D
  insert into public.question_gift_map(question_id, gift) values
    (4,'D_EXHORTATION'), (13,'D_EXHORTATION'), (22,'D_EXHORTATION'), (31,'D_EXHORTATION'), (40,'D_EXHORTATION')
  on conflict (question_id) do nothing;

  -- E
  insert into public.question_gift_map(question_id, gift) values
    (5,'E_GIVING'), (14,'E_GIVING'), (23,'E_GIVING'), (32,'E_GIVING'), (41,'E_GIVING')
  on conflict (question_id) do nothing;

  -- F
  insert into public.question_gift_map(question_id, gift) values
    (6,'F_LEADERSHIP'), (15,'F_LEADERSHIP'), (24,'F_LEADERSHIP'), (33,'F_LEADERSHIP'), (42,'F_LEADERSHIP')
  on conflict (question_id) do nothing;

  -- G
  insert into public.question_gift_map(question_id, gift) values
    (7,'G_MERCY'), (16,'G_MERCY'), (25,'G_MERCY'), (34,'G_MERCY'), (43,'G_MERCY')
  on conflict (question_id) do nothing;

  -- H
  insert into public.question_gift_map(question_id, gift) values
    (8,'H_EVANGELISM'), (17,'H_EVANGELISM'), (26,'H_EVANGELISM'), (35,'H_EVANGELISM'), (44,'H_EVANGELISM')
  on conflict (question_id) do nothing;

  -- I
  insert into public.question_gift_map(question_id, gift) values
    (9,'I_PASTOR'), (18,'I_PASTOR'), (27,'I_PASTOR'), (36,'I_PASTOR'), (45,'I_PASTOR')
  on conflict (question_id) do nothing;
end$$;

-- =========================================================
-- QUIZ SESSIONS & ANSWERS
-- =========================================================
create table if not exists public.quiz_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default timezone('utc', now()),
  completed_at timestamptz
);

create table if not exists public.answers (
  session_id   uuid not null references public.quiz_sessions(id) on delete cascade,
  question_id  smallint not null references public.questions(id) on delete restrict,
  score        smallint not null check (score between 0 and 3),
  created_at   timestamptz not null default timezone('utc', now()),
  primary key (session_id, question_id)
);

-- RLS
alter table public.quiz_sessions enable row level security;
alter table public.answers enable row level security;

-- Policies (idempotentes)
do $$
begin
  -- quiz_sessions
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='quiz_sessions' and policyname='quiz_sessions_select_own') then
    create policy quiz_sessions_select_own
      on public.quiz_sessions for select
      using (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='quiz_sessions' and policyname='quiz_sessions_insert_self') then
    create policy quiz_sessions_insert_self
      on public.quiz_sessions for insert
      with check (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='quiz_sessions' and policyname='quiz_sessions_update_own') then
    create policy quiz_sessions_update_own
      on public.quiz_sessions for update
      using (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='quiz_sessions' and policyname='quiz_sessions_delete_own') then
    create policy quiz_sessions_delete_own
      on public.quiz_sessions for delete
      using (user_id = auth.uid());
  end if;

  -- answers (via ownership da session)
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='answers' and policyname='answers_select_own_session') then
    create policy answers_select_own_session
      on public.answers for select
      using (exists (select 1 from public.quiz_sessions s where s.id = session_id and s.user_id = auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='answers' and policyname='answers_insert_own_session') then
    create policy answers_insert_own_session
      on public.answers for insert
      with check (exists (select 1 from public.quiz_sessions s where s.id = session_id and s.user_id = auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='answers' and policyname='answers_update_own_session') then
    create policy answers_update_own_session
      on public.answers for update
      using (exists (select 1 from public.quiz_sessions s where s.id = session_id and s.user_id = auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='answers' and policyname='answers_delete_own_session') then
    create policy answers_delete_own_session
      on public.answers for delete
      using (exists (select 1 from public.quiz_sessions s where s.id = session_id and s.user_id = auth.uid()));
  end if;
end$$;

-- =========================================================
-- RESULTS: view + rpc
-- =========================================================
create or replace view public.quiz_results as
select
  a.session_id,
  qgm.gift,
  sum(a.score)::int as total
from public.answers a
join public.question_gift_map qgm on qgm.question_id = a.question_id
group by a.session_id, qgm.gift;

-- RPC: calcula somatório por gift para uma sessão
create or replace function public.calculate_quiz_result(p_session_id uuid)
returns table (gift public.gift_key, total int)
language sql
stable
as $$
  select gift, sum(score)::int as total
  from public.answers a
  join public.question_gift_map m on m.question_id = a.question_id
  where a.session_id = p_session_id
  group by gift
  order by total desc, gift asc;
$$;

-- RPC: top-N gifts (default 3)
create or replace function public.best_gifts(p_session_id uuid, p_limit int default 3)
returns table (gift public.gift_key, total int)
language sql
stable
as $$
  select gift, total
  from public.calculate_quiz_result(p_session_id)
  order by total desc, gift asc
  limit greatest(p_limit, 1);
$$;

-- =========================================================
-- Trigger: marca completed_at quando 45 respostas existem
-- =========================================================
create or replace function public.finalize_session_if_complete()
returns trigger
language plpgsql
as $$
declare
  answered int;
begin
  select count(*) into answered
  from public.answers
  where session_id = new.session_id;

  if answered >= 45 then
    update public.quiz_sessions
      set completed_at = coalesce(completed_at, timezone('utc', now()))
    where id = new.session_id;
  end if;

  return null;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'answers_finalize_session'
  ) then
    create trigger answers_finalize_session
      after insert or update or delete on public.answers
      for each row
      execute function public.finalize_session_if_complete();
  end if;
end$$;

-- =========================================================
-- Read-only access to catalog tables (optional for admins)
-- =========================================================
-- grant usage on schema public to anon, authenticated;
-- grant select on all tables in schema public to anon, authenticated;

-- Done!
