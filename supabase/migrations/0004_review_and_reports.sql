-- 0004_review_and_reports.sql
-- Article review flow and reader reports.

do $$
begin
  if not exists (
    select 1 from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      where t.typname = 'article_status' and e.enumlabel = 'in_review'
  ) then
    alter type public.article_status add value 'in_review' before 'published';
  end if;
end $$;

alter table public.articles
  add column if not exists review_note text;

create or replace function public.enforce_article_publish_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin(auth.uid()) then
    return new;
  end if;

  if TG_OP = 'INSERT' then
    new.status := 'draft';
    new.review_note := null;
    new.published_at := null;
    return new;
  end if;

  if new.status <> old.status then
    if not (
      (old.status = 'draft'      and new.status in ('draft', 'in_review'))
      or (old.status = 'in_review' and new.status = 'in_review')
      or (old.status = 'published' and new.status = 'published')
      or (old.status = 'archived'  and new.status = 'archived')
    ) then
      raise exception 'Contributors cannot change article status from % to %.',
        old.status, new.status
        using errcode = '42501';
    end if;
  end if;

  if coalesce(new.review_note, '') is distinct from coalesce(old.review_note, '') then
    new.review_note := old.review_note;
  end if;

  return new;
end;
$$;

drop trigger if exists articles_enforce_publish_rules on public.articles;
create trigger articles_enforce_publish_rules
  before insert or update on public.articles
  for each row execute function public.enforce_article_publish_rules();

create or replace function public.approve_article(article_id uuid)
returns public.articles
language plpgsql
security definer
set search_path = public
as $$
declare
  art public.articles;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Only admins can approve articles.' using errcode = '42501';
  end if;

  update public.articles
     set status       = 'published',
         review_note  = null,
         published_at = coalesce(published_at, now()),
         updated_at   = now()
   where id = article_id
     and status = 'in_review'
  returning * into art;

  if not found then
    raise exception 'Article % is not in review.', article_id using errcode = '22023';
  end if;

  return art;
end;
$$;

revoke all on function public.approve_article(uuid) from public;
grant execute on function public.approve_article(uuid) to authenticated;

do $$ begin
  create type public.article_report_status as enum ('open', 'resolved', 'dismissed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.article_report_reason as enum ('wrong_info', 'unsafe', 'spam', 'other');
exception when duplicate_object then null; end $$;

create table if not exists public.article_reports (
  id                uuid primary key default gen_random_uuid(),
  article_id        uuid not null references public.articles(id) on delete cascade,
  reporter_user_id  uuid references public.profiles(id) on delete set null,
  reporter_email    citext,
  reason            public.article_report_reason not null,
  note              text,
  status            public.article_report_status not null default 'open',
  resolved_by       uuid references public.profiles(id) on delete set null,
  resolved_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists article_reports_article_idx
  on public.article_reports (article_id, status);
create index if not exists article_reports_status_created_idx
  on public.article_reports (status, created_at desc);

drop trigger if exists article_reports_set_updated_at on public.article_reports;
create trigger article_reports_set_updated_at
  before update on public.article_reports
  for each row execute function public.set_updated_at();

alter table public.article_reports enable row level security;

drop policy if exists "reports insert anyone" on public.article_reports;
create policy "reports insert anyone"
  on public.article_reports
  for insert
  with check (
    status = 'open'
    and (reporter_user_id is null or reporter_user_id = auth.uid())
  );

drop policy if exists "reports admin read" on public.article_reports;
create policy "reports admin read"
  on public.article_reports
  for select
  using (public.is_admin());

drop policy if exists "reports self read" on public.article_reports;
create policy "reports self read"
  on public.article_reports
  for select
  using (reporter_user_id = auth.uid());

drop policy if exists "reports admin update" on public.article_reports;
create policy "reports admin update"
  on public.article_reports
  for update
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.resolve_article_report(
  report_id uuid,
  action_kind text,
  reason_text text default null
)
returns public.article_reports
language plpgsql
security definer
set search_path = public
as $$
declare
  reviewer uuid := auth.uid();
  rep public.article_reports;
begin
  if not public.is_admin(reviewer) then
    raise exception 'Only admins can resolve reports.' using errcode = '42501';
  end if;

  if action_kind not in ('dismiss', 'unpublish') then
    raise exception 'Unknown action %.', action_kind using errcode = '22023';
  end if;

  select * into rep
  from public.article_reports
  where id = report_id
  for update;

  if not found then
    raise exception 'Report % not found.', report_id using errcode = 'P0002';
  end if;

  if rep.status <> 'open' then
    raise exception 'Report % is already %.', report_id, rep.status
      using errcode = '22023';
  end if;

  if action_kind = 'unpublish' then
    update public.articles
       set status = 'draft',
           review_note = coalesce(nullif(btrim(reason_text), ''),
                                  'Unpublished after a reader report.'),
           updated_at = now()
     where id = rep.article_id;
  end if;

  update public.article_reports
     set status = case action_kind
                    when 'dismiss'   then 'dismissed'::public.article_report_status
                    else                'resolved'::public.article_report_status
                  end,
         resolved_by = reviewer,
         resolved_at = now(),
         updated_at  = now()
   where id = report_id
   returning * into rep;

  return rep;
end;
$$;

revoke all on function public.resolve_article_report(uuid, text, text) from public;
grant execute on function public.resolve_article_report(uuid, text, text)
  to authenticated;
