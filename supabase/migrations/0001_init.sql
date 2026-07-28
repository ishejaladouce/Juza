-- 0001_init.sql
-- Core tables: profiles, categories, articles, bookmarks, RLS.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";
create extension if not exists "citext";

do $$ begin
  create type public.user_role as enum ('citizen', 'contributor', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.article_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.language_code as enum ('en', 'fr', 'rw');
exception when duplicate_object then null; end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     citext unique,
  full_name    text,
  avatar_url   text,
  bio          text,
  role         public.user_role not null default 'citizen',
  preferred_language public.language_code not null default 'en',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role = 'admin'
  );
$$;

create or replace function public.is_contributor_or_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role in ('contributor', 'admin')
  );
$$;

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin(auth.uid()) then
    raise exception 'only admins can change a user role';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_escalation on public.profiles;
create trigger profiles_prevent_role_escalation
before update on public.profiles
for each row execute function public.prevent_role_escalation();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  slug         citext not null unique,
  name_en      text not null,
  name_fr      text not null,
  name_rw      text not null,
  description_en text,
  description_fr text,
  description_rw text,
  icon         text,
  sort_order   int  not null default 100,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create index if not exists categories_sort_idx on public.categories(sort_order);

create table if not exists public.articles (
  id                    uuid primary key default gen_random_uuid(),
  translation_group_id  uuid not null default gen_random_uuid(),
  language              public.language_code not null,
  slug                  citext not null,
  title                 text   not null,
  excerpt               text,
  body                  text   not null default '',
  category_id           uuid references public.categories(id) on delete set null,
  author_id             uuid references public.profiles(id)   on delete set null,
  status                public.article_status not null default 'draft',
  published_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint articles_slug_lang_unique unique (slug, language),
  constraint articles_published_has_timestamp
    check (status <> 'published' or published_at is not null)
);

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

create or replace function public.articles_set_published_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists articles_set_published_at on public.articles;
create trigger articles_set_published_at
before insert or update on public.articles
for each row execute function public.articles_set_published_at();

create index if not exists articles_language_status_pub_idx
  on public.articles (language, status, published_at desc);

create index if not exists articles_category_language_idx
  on public.articles (category_id, language, status);

create index if not exists articles_author_idx
  on public.articles (author_id);

create index if not exists articles_translation_group_idx
  on public.articles (translation_group_id);

alter table public.articles
  add column if not exists search_tsv tsvector
  generated always as (
    setweight(to_tsvector('simple', coalesce(title,   '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(body,    '')), 'C')
  ) stored;

create index if not exists articles_search_tsv_idx
  on public.articles using gin (search_tsv);

create index if not exists articles_title_trgm_idx
  on public.articles using gin (title gin_trgm_ops);

create table if not exists public.saved_articles (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  article_id   uuid not null references public.articles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id, article_id)
);

create index if not exists saved_articles_user_idx
  on public.saved_articles (user_id, created_at desc);

alter table public.profiles       enable row level security;
alter table public.categories     enable row level security;
alter table public.articles       enable row level security;
alter table public.saved_articles enable row level security;

drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles
  for select
  using (true);

drop policy if exists "profiles update self" on public.profiles;
create policy "profiles update self" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles update by admin" on public.profiles;
create policy "profiles update by admin" on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "profiles delete by admin" on public.profiles;
create policy "profiles delete by admin" on public.profiles
  for delete
  using (public.is_admin());

drop policy if exists "categories read" on public.categories;
create policy "categories read" on public.categories
  for select
  using (true);

drop policy if exists "categories write by admin" on public.categories;
create policy "categories write by admin" on public.categories
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "articles read published" on public.articles;
create policy "articles read published" on public.articles
  for select
  using (status = 'published');

drop policy if exists "articles read own" on public.articles;
create policy "articles read own" on public.articles
  for select
  using (auth.uid() is not null and author_id = auth.uid());

drop policy if exists "articles read by admin" on public.articles;
create policy "articles read by admin" on public.articles
  for select
  using (public.is_admin());

drop policy if exists "articles insert by contributor" on public.articles;
create policy "articles insert by contributor" on public.articles
  for insert
  with check (
    public.is_contributor_or_admin()
    and (public.is_admin() or author_id = auth.uid())
  );

drop policy if exists "articles update own" on public.articles;
create policy "articles update own" on public.articles
  for update
  using (author_id = auth.uid() and public.is_contributor_or_admin())
  with check (author_id = auth.uid() and public.is_contributor_or_admin());

drop policy if exists "articles delete own" on public.articles;
create policy "articles delete own" on public.articles
  for delete
  using (author_id = auth.uid() and public.is_contributor_or_admin());

drop policy if exists "articles update by admin" on public.articles;
create policy "articles update by admin" on public.articles
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "articles delete by admin" on public.articles;
create policy "articles delete by admin" on public.articles
  for delete
  using (public.is_admin());

drop policy if exists "saved read own" on public.saved_articles;
create policy "saved read own" on public.saved_articles
  for select
  using (auth.uid() = user_id);

drop policy if exists "saved insert own" on public.saved_articles;
create policy "saved insert own" on public.saved_articles
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "saved delete own" on public.saved_articles;
create policy "saved delete own" on public.saved_articles
  for delete
  using (auth.uid() = user_id);

insert into public.categories (slug, name_en, name_fr, name_rw,
                               description_en, description_fr, description_rw,
                               icon, sort_order)
values
  ('rights-and-freedoms',
    'Rights & Freedoms',        'Droits et libertés',       'Uburenganzira n''ubwisanzure',
    'Constitution, courts, protections.',
    'Constitution, tribunaux, protections.',
    'Itegeko-Nshinga, inkiko, kurindwa.',
    'scale', 10),
  ('public-services',
    'Public Services',          'Services publics',         'Serivisi rusange',
    'IDs, health, education, water.',
    'Papiers, santé, éducation, eau.',
    'Indangamuntu, ubuzima, uburezi, amazi.',
    'building-2', 20),
  ('elections-and-governance',
    'Elections & Governance',   'Élections et gouvernance', 'Amatora n''imiyoborere',
    'How decisions get made.',
    'Comment se prennent les décisions.',
    'Uko ibyemezo bifatwa.',
    'vote', 30),
  ('work-and-money',
    'Work & Money',             'Travail et argent',        'Akazi n''amafaranga',
    'Jobs, taxes, benefits, small business.',
    'Emploi, impôts, aides, petite entreprise.',
    'Akazi, imisoro, inkunga, ubucuruzi buto.',
    'briefcase', 40),
  ('land-and-housing',
    'Land & Housing',           'Terre et logement',        'Ubutaka n''amazu',
    'Titles, disputes, rent, planning.',
    'Titres, litiges, loyer, urbanisme.',
    'Impapuro z''ubutaka, amakimbirane, ubukode, imitunganyirize.',
    'home', 50)
on conflict (slug) do nothing;
