-- 0009_follows_and_notifications.sql
-- Follows and in-app notifications.

create table if not exists public.article_follows (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  article_id  uuid not null references public.articles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, article_id)
);

create index if not exists article_follows_article_idx
  on public.article_follows (article_id);

alter table public.article_follows enable row level security;

drop policy if exists "follows read own" on public.article_follows;
create policy "follows read own"
  on public.article_follows for select
  using (auth.uid() = user_id);

drop policy if exists "follows insert own" on public.article_follows;
create policy "follows insert own"
  on public.article_follows for insert
  with check (auth.uid() = user_id);

drop policy if exists "follows delete own" on public.article_follows;
create policy "follows delete own"
  on public.article_follows for delete
  using (auth.uid() = user_id);

-- Admins can read all follows.
drop policy if exists "follows admin read" on public.article_follows;
create policy "follows admin read"
  on public.article_follows for select
  using (public.is_admin());

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  article_id  uuid references public.articles(id) on delete set null,
  kind        text not null default 'article_updated'
                check (kind in ('article_updated', 'article_published', 'system')),
  title       text not null,
  body        text,
  link        text,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id)
  where read_at is null;

alter table public.notifications enable row level security;

drop policy if exists "notifications read own" on public.notifications;
create policy "notifications read own"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "notifications update own" on public.notifications;
create policy "notifications update own"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "notifications delete own" on public.notifications;
create policy "notifications delete own"
  on public.notifications for delete
  using (auth.uid() = user_id);

-- Notify followers on publish or content change.
create or replace function public.notify_followers_on_article_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  notif_kind text;
  notif_title text;
  notif_body text;
  notif_link text;
begin
  if tg_op <> 'UPDATE' then
    return new;
  end if;

  if new.status <> 'published' then
    return new;
  end if;

  -- Only when newly published or content fields change.
  if old.status is distinct from 'published' then
    notif_kind := 'article_published';
    notif_title := 'An article you follow is now published';
    notif_body := new.title;
  elsif
    old.title is distinct from new.title
    or old.excerpt is distinct from new.excerpt
    or old.body is distinct from new.body
  then
    notif_kind := 'article_updated';
    notif_title := 'An article you follow was updated';
    notif_body := new.title;
  else
    return new;
  end if;

  notif_link := '/article/' || new.slug;

  insert into public.notifications (user_id, article_id, kind, title, body, link)
  select f.user_id, new.id, notif_kind, notif_title, notif_body, notif_link
  from public.article_follows f
  where f.article_id = new.id
    and f.user_id is distinct from new.author_id;

  return new;
end;
$$;

drop trigger if exists articles_notify_followers on public.articles;
create trigger articles_notify_followers
  after update on public.articles
  for each row execute function public.notify_followers_on_article_change();

-- Preferred language from signup metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  lang text := coalesce(new.raw_user_meta_data->>'preferred_language', 'en');
begin
  if lang not in ('en', 'fr', 'rw') then
    lang := 'en';
  end if;

  insert into public.profiles (id, full_name, avatar_url, preferred_language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    lang::public.language_code
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
