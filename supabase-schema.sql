-- =========================================================
-- Spiritual Gifts Quiz – Complete Schema (Supabase/Postgres)
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
      'G_MERCY'
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

-- Seed gifts (idempotent)
insert into public.gifts (key, name, description) values
  ('A_PROPHECY'::public.gift_key,   'Prophecy',    'Proclaim truth with clarity and conviction'),
  ('B_SERVICE'::public.gift_key,    'Service',     'Practical support and helps'),
  ('C_TEACHING'::public.gift_key,   'Teaching',    'Explain truth faithfully and clearly'),
  ('D_EXHORTATION'::public.gift_key,'Exhortation', 'Encourage and counsel toward action'),
  ('E_GIVING'::public.gift_key,     'Giving',      'Share resources generously'),
  ('F_LEADERSHIP'::public.gift_key, 'Leadership',  'Organize and guide toward goals'),
  ('G_MERCY'::public.gift_key,      'Mercy',       'Care for the hurting and overlooked')
on conflict (key) do nothing;

-- =========================================================
-- QUESTIONS (1..45)
-- =========================================================
create table if not exists public.questions (
  id    smallint primary key check (id between 1 and 45),
  text  text not null
);

-- Seed real questions from PDF
insert into public.questions (id, text) values
  (1, 'Gosto de apresentar a verdade de Deus numa forma interessante e entusiasta.'),
  (2, 'Estou sempre pronto para colocar em posição secundária meu conforto pessoal a fim de que as necessidades alheias sejam satisfeitas.'),
  (3, 'Tenho facilidade para explorar a verdade de um texto dentro do seu contexto.'),
  (4, 'Procuro incentivar individualmente os que vacilam e tem problemas espirituais.'),
  (5, 'Administro meu dinheiro, mesmo quando pouco, de modo a separar uma quantia generosa para o trabalho de Deus.'),
  (6, 'Acho fácil delegar responsabilidades e preparar outras pessoas para realizações no campo espiritual.'),
  (7, 'Sou muito sensível às necessidades dos outros.'),
  (8, 'Acho fácil falar de Jesus para não crentes.'),
  (9, 'Gosto de acompanhar cristãos para ajudá-los no seu crescimento espiritual.'),
  (10, 'Quando tento persuadir pessoas a respeito de suas reais motivações, faço-o de modo muito convincente.'),
  (11, 'Consigo levar pessoas a se sentirem à vontade na minha presença.'),
  (12, 'Sinto grande impulso para descobrir conceitos bíblicos e repassá-los a outros.'),
  (13, 'Sempre estou interessado e procuro ajudar o crescimento espiritual das pessoas e levá-las a serem ativas na obra de Deus.'),
  (14, 'Alegro-me em dar recursos materiais, de sorte que a obra do Senhor possa ser promovida.'),
  (15, 'Sou eficiente em supervisionar as atividades dos outros.'),
  (16, 'Gosto de visitar pessoas hospitalizadas ou que não podem sair de casa.'),
  (17, 'Já tive experiências de levar outros à fé em Jesus.'),
  (18, 'Tenho experiência de levar cristãos a permanecerem firmes na fé devido ao meu acompanhamento.'),
  (19, 'Posso apresentar a Palavra de Deus a uma congregação de pessoas com clareza a ponto de serem trazidas à luz verdades escondidas.'),
  (20, 'Sinto-me feliz quando solicitado a dar assistência a outros na obra do Senhor sem necessariamente ser indicado para um posto de liderança.'),
  (21, 'Sou muito interessado em apresentar conceitos bíblicos de modo bem claro, dando especial atenção a definição de palavras importantes no texto.'),
  (22, 'Sinto-me feliz por poder tratar as pessoas feridas espiritualmente.'),
  (23, 'Não tenho nenhum problema em confiar os meus recursos a outros para a obra do ministério.'),
  (24, 'Posso planejar as ações de outras pessoas, com calma, e dar-lhes os detalhes que as capacitem a trabalhar com eficiência.'),
  (25, 'Tenho grande interesse pelos que se acham envolvidos em dificuldades.'),
  (26, 'Considero um grande problema o fato de muitos cristãos não falarem aos outros da sua fé em Jesus.'),
  (27, 'Preocupo-me com o fato de que muitos cristãos não receberem um acompanhamento na sua vida pessoal e espiritual.'),
  (28, 'Esforço-me grandemente para obter resultados, sempre que apresento as verdades da Palavra de Deus.'),
  (29, 'Sinto-me bem quando proporciono um agradável acolhimento aos hóspedes.'),
  (30, 'Sou diligente em meu estudo da Bíblia e dispenso cuidadosa atenção à necessária pesquisa, não apenas para mostrar sabedoria, mas porque eu gosto.'),
  (31, 'Julgo poder ajudar os que têm necessidades de aconselhamento sobre problemas pessoais.'),
  (32, 'Preocupo-me em saber que o trabalho de assistência social está sendo suprido de recursos.'),
  (33, 'Procuro estar ciente dos recursos disponíveis para a execução das tarefas que tenho que realizar.'),
  (34, 'Sinto-me feliz quando consigo atingir pessoas geralmente esquecidas pelos outros.'),
  (35, 'Para mim é fácil perceber quando uma pessoa está aberta a aceitar o evangelho.'),
  (36, 'É fácil, para mim, acompanhar pessoalmente um grupo de cristãos e me empenhar pela sua unidade.'),
  (37, 'Verifico que minha pregação leve pessoas a um ponto de decisão definido.'),
  (38, 'Gosto de aliviar a carga das pessoas que ocupam uma posição-chave, de sorte que possam esforçar-se mais em tarefas a elas concernentes.'),
  (39, 'Posso explicar bem como a Bíblia mantém sua unidade.'),
  (40, 'Sou agudamente consciente das coisas que impedem as pessoas em seu desenvolvimento espiritual e anseio por ajudá-las a vencer seus problemas.'),
  (41, 'Sou cuidadoso com a questão de dinheiro e oro continuamente acerca de sua distribuição adequada na obra do Senhor.'),
  (42, 'Tenho objetivos bem definidos e consigo levar outros a assumirem meus objetivos.'),
  (43, 'Posso relacionar-me com outras pessoas emocionalmente e me disponho a ajudá-las quando for necessário.'),
  (44, 'Estou disposto a freqüentar um curso preparatório para o evangelismo.'),
  (45, 'Estou disposto a assumir a responsabilidade por um grupo de irmãos.')
on conflict (id) do update set text = excluded.text;

-- =========================================================
-- QUESTION → GIFT MAP (blocks of 5 per letter A..G)
-- A: 1,10,19,28,37 | B: 2,11,20,29,38 | C: 3,12,21,30,39 | D: 4,13,22,31,40 | E: 5,14,23,32,41 | F: 6,15,24,33,42 | G: 7,16,25,34,43
-- =========================================================
create table if not exists public.question_gift_map (
  question_id smallint primary key references public.questions(id) on delete cascade,
  gift        public.gift_key not null
);

-- Seed mapping (idempotent)
do $$
begin
  -- A - PROPHECY
  insert into public.question_gift_map(question_id, gift) values
    (1,'A_PROPHECY'), (10,'A_PROPHECY'), (19,'A_PROPHECY'), (28,'A_PROPHECY'), (37,'A_PROPHECY')
  on conflict (question_id) do nothing;

  -- B - SERVICE
  insert into public.question_gift_map(question_id, gift) values
    (2,'B_SERVICE'), (11,'B_SERVICE'), (20,'B_SERVICE'), (29,'B_SERVICE'), (38,'B_SERVICE')
  on conflict (question_id) do nothing;

  -- C - TEACHING
  insert into public.question_gift_map(question_id, gift) values
    (3,'C_TEACHING'), (12,'C_TEACHING'), (21,'C_TEACHING'), (30,'C_TEACHING'), (39,'C_TEACHING')
  on conflict (question_id) do nothing;

  -- D - EXHORTATION
  insert into public.question_gift_map(question_id, gift) values
    (4,'D_EXHORTATION'), (13,'D_EXHORTATION'), (22,'D_EXHORTATION'), (31,'D_EXHORTATION'), (40,'D_EXHORTATION')
  on conflict (question_id) do nothing;

  -- E - GIVING
  insert into public.question_gift_map(question_id, gift) values
    (5,'E_GIVING'), (14,'E_GIVING'), (23,'E_GIVING'), (32,'E_GIVING'), (41,'E_GIVING')
  on conflict (question_id) do nothing;

  -- F - LEADERSHIP
  insert into public.question_gift_map(question_id, gift) values
    (6,'F_LEADERSHIP'), (15,'F_LEADERSHIP'), (24,'F_LEADERSHIP'), (33,'F_LEADERSHIP'), (42,'F_LEADERSHIP')
  on conflict (question_id) do nothing;

  -- G - MERCY
  insert into public.question_gift_map(question_id, gift) values
    (7,'G_MERCY'), (16,'G_MERCY'), (25,'G_MERCY'), (34,'G_MERCY'), (43,'G_MERCY')
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

-- Policies (idempotent)
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

  -- answers (via ownership of session)
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

-- RPC: calculate total score by gift for a session
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
-- Trigger: mark completed_at when 45 answers exist
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
-- DETAILED SPIRITUAL GIFTS SYSTEM
-- =========================================================

-- Categories of spiritual gifts
create table if not exists public.categories (
  id int generated by default as identity primary key,
  name varchar(50) not null unique,
  greek_term varchar(50),
  description text,
  purpose text
);

-- Detailed spiritual gifts
create table if not exists public.spiritual_gifts (
  id int generated by default as identity primary key,
  category_id int references public.categories(id),
  name varchar(100) not null,
  definition text,
  biblical_references varchar(200)
);

-- Qualities for each gift
create table if not exists public.qualities (
  id int generated by default as identity primary key,
  gift_id int references public.spiritual_gifts(id),
  quality_name varchar(100) not null,
  description text,
  order_sequence int
);

-- Characteristics of each gift
create table if not exists public.characteristics (
  id int generated by default as identity primary key,
  gift_id int references public.spiritual_gifts(id),
  characteristic text not null,
  order_sequence int
);

-- Dangers for each gift
create table if not exists public.dangers (
  id int generated by default as identity primary key,
  gift_id int references public.spiritual_gifts(id),
  danger text not null,
  order_sequence int
);

-- Misunderstandings about each gift
create table if not exists public.misunderstandings (
  id int generated by default as identity primary key,
  gift_id int references public.spiritual_gifts(id),
  misunderstanding text not null,
  order_sequence int
);

-- Ministries
create table if not exists public.ministries (
  id int generated by default as identity primary key,
  name varchar(100) not null,
  definition text,
  biblical_references varchar(200),
  type text check (type in ('PRIMARY', 'OTHER')) default 'OTHER'
);

-- Manifestations of the Spirit
create table if not exists public.manifestations (
  id int generated by default as identity primary key,
  name varchar(100) not null,
  definition text,
  classification text check (
    classification in ('DISCERNIMENTO', 'PODER', 'DECLARACAO')
  ),
  biblical_references varchar(200)
);

-- Principles of manifestations
create table if not exists public.manifestation_principles (
  id int generated by default as identity primary key,
  principle text not null,
  order_sequence int
);

-- Biblical activities
create table if not exists public.biblical_activities (
  id int generated by default as identity primary key,
  activity_name varchar(100) not null,
  biblical_reference varchar(100),
  biblical_text text
);

-- Bridge table linking quiz gifts to detailed spiritual gifts
create table if not exists public.gift_bridge (
  gift public.gift_key primary key,
  spiritual_gift_id int not null references public.spiritual_gifts(id) on delete restrict
);

-- =========================================================
-- DATA SEEDING
-- =========================================================

-- Insert Categories
insert into public.categories (name, greek_term, description, purpose) values
  ('MOTIVAÇÕES', 'Karismation', 'Impulso básico implantado no interior de cada cristão para que Deus expresse Seu amor', 'Para cada indivíduo ter e segurar'),
  ('MINISTÉRIOS', 'Diakonion', 'O serviço cristão que Deus determina para cada um, para poder exercer a sua motivação', 'Para a Igreja'),
  ('MANIFESTAÇÕES', 'Energias planerosis', 'Manifestações determinadas pelo Espírito Santo, necessárias para capacitar a pessoa a ser bem sucedida em seu ministério', 'Para indivíduos momentaneamente, enquanto ministram conforme a vontade de Deus')
on conflict (name) do nothing;

-- Insert Motivation Gifts
do $$
begin
  -- PROFECIA
  if not exists (select 1 from public.spiritual_gifts where upper(name) = 'PROFECIA') then
    insert into public.spiritual_gifts (category_id, name, definition, biblical_references)
    select c.id, 'PROFECIA', 'A motivação divina a revelar motivos e ações injustas através da apresentação da verdade', 'Rm 12:3-8; I Pe 4:10; I Co 12:4'
    from public.categories c where c.name = 'MOTIVAÇÕES';
  end if;

  -- MINISTÉRIO
  if not exists (select 1 from public.spiritual_gifts where upper(name) = 'MINISTÉRIO') then
    insert into public.spiritual_gifts (category_id, name, definition, biblical_references)
    select c.id, 'MINISTÉRIO', 'A motivação a demonstrar o amor no suprimento de necessidades práticas', 'Rm 12:3-8; I Pe 4:10; I Co 12:4'
    from public.categories c where c.name = 'MOTIVAÇÕES';
  end if;

  -- ENSINO
  if not exists (select 1 from public.spiritual_gifts where upper(name) = 'ENSINO') then
    insert into public.spiritual_gifts (category_id, name, definition, biblical_references)
    select c.id, 'ENSINO', 'A motivação a pesquisar, esclarecer e preparar material bíblico para ser apresentado a outros', 'Rm 12:3-8; I Pe 4:10; I Co 12:4'
    from public.categories c where c.name = 'MOTIVAÇÕES';
  end if;

  -- EXORTAÇÃO
  if not exists (select 1 from public.spiritual_gifts where upper(name) = 'EXORTAÇÃO') then
    insert into public.spiritual_gifts (category_id, name, definition, biblical_references)
    select c.id, 'EXORTAÇÃO', 'A motivação a estimular a fé dos outros', 'Rm 12:3-8; I Pe 4:10; I Co 12:4'
    from public.categories c where c.name = 'MOTIVAÇÕES';
  end if;

  -- CONTRIBUIÇÃO
  if not exists (select 1 from public.spiritual_gifts where upper(name) = 'CONTRIBUIÇÃO') then
    insert into public.spiritual_gifts (category_id, name, definition, biblical_references)
    select c.id, 'CONTRIBUIÇÃO', 'A motivação a entregar recursos pessoais a outros para a expansão do ministério deles', 'Rm 12:3-8; I Pe 4:10; I Co 12:4'
    from public.categories c where c.name = 'MOTIVAÇÕES';
  end if;

  -- ADMINISTRAÇÃO
  if not exists (select 1 from public.spiritual_gifts where upper(name) = 'ADMINISTRAÇÃO') then
    insert into public.spiritual_gifts (category_id, name, definition, biblical_references)
    select c.id, 'ADMINISTRAÇÃO', 'A motivação a coordenar as atividades de outros para a realização, alvo comum', 'Rm 12:3-8; I Pe 4:10; I Co 12:4'
    from public.categories c where c.name = 'MOTIVAÇÕES';
  end if;

  -- MISERICÓRDIA
  if not exists (select 1 from public.spiritual_gifts where upper(name) = 'MISERICÓRDIA') then
    insert into public.spiritual_gifts (category_id, name, definition, biblical_references)
    select c.id, 'MISERICÓRDIA', 'A motivação a identificar-se com outras pessoas nas suas aflições, para as consolar', 'Rm 12:3-8; I Pe 4:10; I Co 12:4'
    from public.categories c where c.name = 'MOTIVAÇÕES';
  end if;
end$$;

-- Bridge mappings
insert into public.gift_bridge (gift, spiritual_gift_id)
select 'A_PROPHECY', sg.id from public.spiritual_gifts sg where upper(sg.name)='PROFECIA'
on conflict (gift) do update set spiritual_gift_id = excluded.spiritual_gift_id;

insert into public.gift_bridge (gift, spiritual_gift_id)
select 'B_SERVICE', sg.id from public.spiritual_gifts sg where upper(sg.name)='MINISTÉRIO'
on conflict (gift) do update set spiritual_gift_id = excluded.spiritual_gift_id;

insert into public.gift_bridge (gift, spiritual_gift_id)
select 'C_TEACHING', sg.id from public.spiritual_gifts sg where upper(sg.name)='ENSINO'
on conflict (gift) do update set spiritual_gift_id = excluded.spiritual_gift_id;

insert into public.gift_bridge (gift, spiritual_gift_id)
select 'D_EXHORTATION', sg.id from public.spiritual_gifts sg where upper(sg.name)='EXORTAÇÃO'
on conflict (gift) do update set spiritual_gift_id = excluded.spiritual_gift_id;

insert into public.gift_bridge (gift, spiritual_gift_id)
select 'E_GIVING', sg.id from public.spiritual_gifts sg where upper(sg.name)='CONTRIBUIÇÃO'
on conflict (gift) do update set spiritual_gift_id = excluded.spiritual_gift_id;

insert into public.gift_bridge (gift, spiritual_gift_id)
select 'F_LEADERSHIP', sg.id from public.spiritual_gifts sg where upper(sg.name)='ADMINISTRAÇÃO'
on conflict (gift) do update set spiritual_gift_id = excluded.spiritual_gift_id;

insert into public.gift_bridge (gift, spiritual_gift_id)
select 'G_MERCY', sg.id from public.spiritual_gifts sg where upper(sg.name)='MISERICÓRDIA'
on conflict (gift) do update set spiritual_gift_id = excluded.spiritual_gift_id;

-- =========================================================
-- COMPLETE DATA SEEDING
-- =========================================================

-- Insert Primary Ministries
insert into public.ministries (name, definition, biblical_references, type) values
  ('APOSTOLO', 'Alguém enviado pela igreja para um serviço cristão específico', 'I Co 12:27-28; Ef 4:11', 'PRIMARY'),
  ('PROFETA', 'Alguém que proclama a mensagem de Deus principalmente aos crentes', 'I Co 12:27-28; Ef 4:11', 'PRIMARY'),
  ('EVANGELISTA', 'Alguém que proclama a mensagem de Deus aos inconversos', 'I Co 12:27-28; Ef 4:11', 'PRIMARY'),
  ('PASTOR', 'Alguém que supervisiona um grupo de crentes e cuida das suas necessidades', 'I Co 12:27-28; Ef 4:11', 'PRIMARY'),
  ('MESTRE', 'Alguém que esclarece e preserva a Verdade', 'I Co 12:27-28; Ef 4:11', 'PRIMARY')
on conflict (name) do nothing;

-- Insert Other Ministries
insert into public.ministries (name, definition, biblical_references, type) values
  ('OPERADORES DE MILAGRES', 'Alguém que opera sinais e prodígios', 'I Co 12:28', 'OTHER'),
  ('DONS DE CURAR', 'Alguém que opera curas', 'I Co 12:28', 'OTHER'),
  ('SOCORROS', 'Alguém que assiste a liderança no ministério aos necessitados', 'I Co 12:28', 'OTHER'),
  ('GOVERNOS', 'Alguém que guia e dirige a Igreja Local, ou outra obra', 'I Co 12:28', 'OTHER'),
  ('VARIEDADE DE LÍNGUAS', 'Alguém que fala várias línguas pelo Espírito (Interpretação implícita)', 'I Co 12:28', 'OTHER'),
  ('PRESBÍTERO', 'Alguém que cuida da parte espiritual da igreja', 'I Tm; Tt', 'OTHER'),
  ('DIÁCONO', 'Alguém separado para servir', 'I Tm; Tt', 'OTHER')
on conflict (name) do nothing;

-- Insert Manifestations - Discernimento
insert into public.manifestations (name, definition, classification, biblical_references) values
  ('PALAVRA DE SABEDORIA', 'Uma revelação do Espírito mostrando como agir em determinada situação', 'DISCERNIMENTO', 'I Co 12:7-11'),
  ('PALAVRA DE CONHECIMENTO', 'Uma revelação do Espírito mostrando algo desconhecido', 'DISCERNIMENTO', 'I Co 12:7-11'),
  ('DISCERNIMENTO DE ESPÍRITOS', 'Capacidade sobrenatural de discernir as atitudes e manifestações de Deus, do homem ou do diabo', 'DISCERNIMENTO', 'I Co 12:7-11')
on conflict (name) do nothing;

-- Insert Manifestations - Poder
insert into public.manifestations (name, definition, classification, biblical_references) values
  ('FÉ', 'O poder de visualizar algo que Deus quer operar e crer para que aconteça', 'PODER', 'I Co 12:7-11'),
  ('DONS DE CURAR MANIFESTAÇÃO', 'O poder do Espírito curando e trazendo saúde pela aplicação da Verdade', 'PODER', 'I Co 12:7-11'),
  ('OPERAÇÃO DE MILAGRES', 'Prodígios e maravilhas operados pelo poder do Espírito', 'PODER', 'I Co 12:7-11')
on conflict (name) do nothing;

-- Insert Manifestations - Declaracao
insert into public.manifestations (name, definition, classification, biblical_references) values
  ('PROFECIA MANIFESTAÇÃO', 'O Espírito falando através de alguém para a edificação, exortação e consolação de outros', 'DECLARACAO', 'I Co 12:7-11'),
  ('VARIEDADE DE LÍNGUAS MANIFESTAÇÃO', 'Capacidade sobrenatural de adorar a Deus em línguas desconhecidas', 'DECLARACAO', 'I Co 12:7-11'),
  ('INTERPRETAÇÃO DE LÍNGUAS', 'A interpretação de Verdades faladas em línguas desconhecidas', 'DECLARACAO', 'I Co 12:7-11')
on conflict (name) do nothing;

-- Insert Manifestation Principles
insert into public.manifestation_principles (principle, order_sequence) values
  ('As manifestações são dadas conforme a necessidade', 1),
  ('São operadas pelo Espírito Santo', 2),
  ('Devem edificar a igreja', 3),
  ('Não são para exibição pessoal', 4),
  ('Devem ser exercidas com amor', 5)
on conflict (principle) do nothing;

-- Insert Biblical Activities
insert into public.biblical_activities (activity_name, biblical_reference, biblical_text) values
  ('ORAÇÃO', 'I Ts 5:17', 'Orai sem cessar'),
  ('JEJUM', 'Mt 6:16', 'E, quando jejuardes, não vos mostreis contristados como os hipócritas'),
  ('ESTUDO DA PALAVRA', 'II Tm 2:15', 'Procura apresentar-te a Deus aprovado, como obreiro que não tem de que se envergonhar'),
  ('ADORAÇÃO', 'Jo 4:24', 'Deus é Espírito, e importa que os que o adoram o adorem em espírito e em verdade'),
  ('COMUNHÃO', 'Hb 10:25', 'Não deixando a nossa congregação, como é costume de alguns')
on conflict (activity_name) do nothing;

-- =========================================================
-- QUALITIES FOR EACH MOTIVATION GIFT
-- =========================================================

-- Qualities for Prophecy (PROFECIA)
do $$
declare
  gift_profecia_id int;
begin
  select id into gift_profecia_id from public.spiritual_gifts where upper(name) = 'PROFECIA';
  
  if gift_profecia_id is not null then
    -- Insert qualities for PROFECIA
    insert into public.qualities (gift_id, quality_name, description, order_sequence) values
      (gift_profecia_id, 'Um relacionamento certo com Deus', null, 1),
      (gift_profecia_id, 'Honestidade', null, 2),
      (gift_profecia_id, 'Humildade', null, 3),
      (gift_profecia_id, 'Entusiasmo pela sua mensagem', null, 4),
      (gift_profecia_id, 'Amor pelo auditório', null, 5),
      (gift_profecia_id, 'Sensibilidade para com os sentimentos do auditório', null, 6),
      (gift_profecia_id, 'Autoconfiança', null, 7)
    on conflict (gift_id, order_sequence) do nothing;
  end if;
end$$;

-- Qualities for Service (MINISTÉRIO)
do $$
declare
  gift_ministerio_id int;
begin
  select id into gift_ministerio_id from public.spiritual_gifts where upper(name) = 'MINISTÉRIO';
  
  if gift_ministerio_id is not null then
    insert into public.qualities (gift_id, quality_name, description, order_sequence) values
      (gift_ministerio_id, 'Um desejo de trabalhar', null, 1),
      (gift_ministerio_id, 'Disposição para aceitar responsabilidades', null, 2),
      (gift_ministerio_id, 'Iniciativa de reconhecer serviços que precisam ser feitos', null, 3),
      (gift_ministerio_id, 'Uma afeição e desejo para servir a outros', null, 4),
      (gift_ministerio_id, 'Resistência', null, 5),
      (gift_ministerio_id, 'Alegria', null, 6),
      (gift_ministerio_id, 'Humildade', null, 7)
    on conflict (gift_id, order_sequence) do nothing;
  end if;
end$$;

-- Qualities for Teaching (ENSINO)
insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Humildade', null, 1
from public.spiritual_gifts sg where upper(sg.name) = 'ENSINO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Sinceridade e honestidade', null, 2
from public.spiritual_gifts sg where upper(sg.name) = 'ENSINO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Conscientização e escrupulosidade', null, 3
from public.spiritual_gifts sg where upper(sg.name) = 'ENSINO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Organização', null, 4
from public.spiritual_gifts sg where upper(sg.name) = 'ENSINO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Otimismo', null, 5
from public.spiritual_gifts sg where upper(sg.name) = 'ENSINO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Discernimento', null, 6
from public.spiritual_gifts sg where upper(sg.name) = 'ENSINO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Paciência', null, 7
from public.spiritual_gifts sg where upper(sg.name) = 'ENSINO'
on conflict do nothing;

-- Qualities for Exhortation (EXORTAÇÃO)
insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Humildade', null, 1
from public.spiritual_gifts sg where upper(sg.name) = 'EXORTAÇÃO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Disponibilidade', null, 2
from public.spiritual_gifts sg where upper(sg.name) = 'EXORTAÇÃO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Relação certa com Deus e um andar no Espírito', null, 3
from public.spiritual_gifts sg where upper(sg.name) = 'EXORTAÇÃO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Paciência', null, 4
from public.spiritual_gifts sg where upper(sg.name) = 'EXORTAÇÃO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Disposição para ouvir', null, 5
from public.spiritual_gifts sg where upper(sg.name) = 'EXORTAÇÃO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Otimismo', null, 6
from public.spiritual_gifts sg where upper(sg.name) = 'EXORTAÇÃO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Diplomacia', null, 7
from public.spiritual_gifts sg where upper(sg.name) = 'EXORTAÇÃO'
on conflict do nothing;

-- Qualities for Giving (CONTRIBUIÇÃO)
insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Amor verdadeiro pelos outros', null, 1
from public.spiritual_gifts sg where upper(sg.name) = 'CONTRIBUIÇÃO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Interesse na obra de Deus', null, 2
from public.spiritual_gifts sg where upper(sg.name) = 'CONTRIBUIÇÃO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Discernimento', null, 3
from public.spiritual_gifts sg where upper(sg.name) = 'CONTRIBUIÇÃO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Sensibilidade à direção de Deus', null, 4
from public.spiritual_gifts sg where upper(sg.name) = 'CONTRIBUIÇÃO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Atitude imaterialista', null, 5
from public.spiritual_gifts sg where upper(sg.name) = 'CONTRIBUIÇÃO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Desejo de dar', null, 6
from public.spiritual_gifts sg where upper(sg.name) = 'CONTRIBUIÇÃO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Humildade', null, 7
from public.spiritual_gifts sg where upper(sg.name) = 'CONTRIBUIÇÃO'
on conflict do nothing;

-- Qualities for Administration (ADMINISTRAÇÃO)
insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Sabedoria: uma compreensão básica das áreas chaves da vida', null, 1
from public.spiritual_gifts sg where upper(sg.name) = 'ADMINISTRAÇÃO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Integridade: pureza de coração e honestidade exterior', null, 2
from public.spiritual_gifts sg where upper(sg.name) = 'ADMINISTRAÇÃO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Humildade: uma visão exata e correta de si mesmo e de seu ministério', null, 3
from public.spiritual_gifts sg where upper(sg.name) = 'ADMINISTRAÇÃO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Dedicação: disciplina dirigida de si mesmo em seu ministério', null, 4
from public.spiritual_gifts sg where upper(sg.name) = 'ADMINISTRAÇÃO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Confiança: saber que pode enfrentar qualquer situação que se apresente, com sucesso', null, 5
from public.spiritual_gifts sg where upper(sg.name) = 'ADMINISTRAÇÃO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Visão: vendo "o quadro todo" e planejando criativa e realisticamente para o futuro', null, 6
from public.spiritual_gifts sg where upper(sg.name) = 'ADMINISTRAÇÃO'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Decisão: confiante e organizado em suas decisões', null, 7
from public.spiritual_gifts sg where upper(sg.name) = 'ADMINISTRAÇÃO'
on conflict do nothing;

-- Qualities for Mercy (MISERICÓRDIA)
insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Interesse e aceitação pelos outros', null, 1
from public.spiritual_gifts sg where upper(sg.name) = 'MISERICÓRDIA'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Humildade', null, 2
from public.spiritual_gifts sg where upper(sg.name) = 'MISERICÓRDIA'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Sinceridade', null, 3
from public.spiritual_gifts sg where upper(sg.name) = 'MISERICÓRDIA'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Paciência', null, 4
from public.spiritual_gifts sg where upper(sg.name) = 'MISERICÓRDIA'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Sensibilidade', null, 5
from public.spiritual_gifts sg where upper(sg.name) = 'MISERICÓRDIA'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Empatia', null, 6
from public.spiritual_gifts sg where upper(sg.name) = 'MISERICÓRDIA'
on conflict do nothing;

insert into public.qualities (gift_id, quality_name, description, order_sequence)
select sg.id, 'Alegria', null, 7
from public.spiritual_gifts sg where upper(sg.name) = 'MISERICÓRDIA'
on conflict do nothing;

-- =========================================================
-- CHARACTERISTICS FOR EACH MOTIVATION GIFT
-- =========================================================

-- Characteristics for Prophecy (PROFECIA)
insert into public.characteristics (gift_id, characteristic, order_sequence)
select sg.id, 'Sente necessidade de expressar sua mensagem, verbalmente', 1
from public.spiritual_gifts sg where upper(sg.name) = 'PROFECIA'
on conflict do nothing;

insert into public.characteristics (gift_id, characteristic, order_sequence)
select sg.id, 'Tem capacidade de discernir os motivos e o caráter dos outros', 2
from public.spiritual_gifts sg where upper(sg.name) = 'PROFECIA'
on conflict do nothing;

insert into public.characteristics (gift_id, characteristic, order_sequence)
select sg.id, 'Tem capacidade de identificar, definir e odiar o mal', 3
from public.spiritual_gifts sg where upper(sg.name) = 'PROFECIA'
on conflict do nothing;

insert into public.characteristics (gift_id, characteristic, order_sequence)
select sg.id, 'Está sempre pronto a experimentar quebrantamento para produzi-lo em outros', 4
from public.spiritual_gifts sg where upper(sg.name) = 'PROFECIA'
on conflict do nothing;

insert into public.characteristics (gift_id, characteristic, order_sequence)
select sg.id, 'Depende das escrituras para validar sua autoridade', 5
from public.spiritual_gifts sg where upper(sg.name) = 'PROFECIA'
on conflict do nothing;

insert into public.characteristics (gift_id, characteristic, order_sequence)
select sg.id, 'Procura evidências externas que demonstrem convicção interna', 6
from public.spiritual_gifts sg where upper(sg.name) = 'PROFECIA'
on conflict do nothing;

insert into public.characteristics (gift_id, characteristic, order_sequence)
select sg.id, 'Usa de exatidão, franqueza e persuasão no falar', 7
from public.spiritual_gifts sg where upper(sg.name) = 'PROFECIA'
on conflict do nothing;

insert into public.characteristics (gift_id, characteristic, order_sequence)
select sg.id, 'Tem zelo pela reputação e obra de Deus', 8
from public.spiritual_gifts sg where upper(sg.name) = 'PROFECIA'
on conflict do nothing;

insert into public.characteristics (gift_id, characteristic, order_sequence)
select sg.id, 'Identifica-se e entristece-se com os pecados daqueles que assiste', 9
from public.spiritual_gifts sg where upper(sg.name) = 'PROFECIA'
on conflict do nothing;

insert into public.characteristics (gift_id, characteristic, order_sequence)
select sg.id, 'Enxerga tudo como sendo certo ou errado, branco ou preto', 10
from public.spiritual_gifts sg where upper(sg.name) = 'PROFECIA'
on conflict do nothing;

insert into public.characteristics (gift_id, characteristic, order_sequence)
select sg.id, 'Acredita que existe uma lógica para tudo', 11
from public.spiritual_gifts sg where upper(sg.name) = 'PROFECIA'
on conflict do nothing;

insert into public.characteristics (gift_id, characteristic, order_sequence)
select sg.id, 'Provavelmente seja uma pessoa autoconfiante com habilidade para estar à vontade em frente a um grupo', 12
from public.spiritual_gifts sg where upper(sg.name) = 'PROFECIA'
on conflict do nothing;

-- Characteristics for Service (MINISTÉRIO)
insert into public.characteristics (gift_id, characteristic, order_sequence)
select sg.id, 'Tem capacidade de lembrar do que os outros gostam ou não', 1
from public.spiritual_gifts sg where upper(sg.name) = 'MINISTÉRIO'
on conflict do nothing;

insert into public.characteristics (gift_id, characteristic, order_sequence)
select sg.id, 'Está sempre atento às necessidades práticas. Prefere o trabalho manual a outro', 2
from public.spiritual_gifts sg where upper(sg.name) = 'MINISTÉRIO'
on conflict do nothing;

insert into public.characteristics (gift_id, characteristic, order_sequence)
select sg.id, 'Impulsionado a suprir as necessidades o mais breve possível', 3
from public.spiritual_gifts sg where upper(sg.name) = 'MINISTÉRIO'
on conflict do nothing;

insert into public.characteristics (gift_id, characteristic, order_sequence)
select sg.id, 'É de resistência física suficiente para suprir estas necessidades sem pensar no cansaço', 4
from public.spiritual_gifts sg where upper(sg.name) = 'MINISTÉRIO'
on conflict do nothing;

insert into public.characteristics (gift_id, characteristic, order_sequence)
select sg.id, 'Está disposto a usar recursos próprios para evitar demora', 5
from public.spiritual_gifts sg where upper(sg.name) = 'MINISTÉRIO'
on conflict do nothing;

-- Enhanced results view with detailed information
create or replace view public.quiz_results_with_details as
select 
  r.session_id,
  r.gift,
  sg.id as spiritual_gift_id,
  sg.name as gift_name,
  sg.definition as gift_definition,
  r.total
from public.quiz_results r
left join public.gift_bridge gb on gb.gift = r.gift
left join public.spiritual_gifts sg on sg.id = gb.spiritual_gift_id
order by r.total desc, r.gift asc;

-- Done!