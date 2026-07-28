-- 0008_report_replies.sql
-- Threaded replies on article reports.

create table if not exists public.article_report_replies (
  id              uuid primary key default gen_random_uuid(),
  report_id       uuid not null references public.article_reports(id) on delete cascade,
  article_id      uuid not null references public.articles(id) on delete cascade,
  author_id       uuid references public.profiles(id) on delete set null,
  author_kind     text not null check (author_kind in ('admin', 'reporter')),
  body            text not null check (char_length(btrim(body)) >= 1 and char_length(body) <= 2000),
  created_at      timestamptz not null default now()
);

create index if not exists article_report_replies_report_idx
  on public.article_report_replies (report_id, created_at asc);

create index if not exists article_report_replies_article_idx
  on public.article_report_replies (article_id, created_at desc);

alter table public.article_report_replies enable row level security;

-- Admins see every reply.
drop policy if exists "report replies admin read" on public.article_report_replies;
create policy "report replies admin read"
  on public.article_report_replies
  for select
  using (public.is_admin());

-- Reporter can read replies on their own reports.
drop policy if exists "report replies reporter read" on public.article_report_replies;
create policy "report replies reporter read"
  on public.article_report_replies
  for select
  using (
    exists (
      select 1
      from public.article_reports r
      where r.id = report_id
        and r.reporter_user_id = auth.uid()
    )
  );

-- Admins can reply as admin.
drop policy if exists "report replies admin insert" on public.article_report_replies;
create policy "report replies admin insert"
  on public.article_report_replies
  for insert
  with check (
    public.is_admin()
    and author_kind = 'admin'
    and (author_id is null or author_id = auth.uid())
  );

-- Reporter can reply on their own open/resolved report.
drop policy if exists "report replies reporter insert" on public.article_report_replies;
create policy "report replies reporter insert"
  on public.article_report_replies
  for insert
  with check (
    author_kind = 'reporter'
    and author_id = auth.uid()
    and exists (
      select 1
      from public.article_reports r
      where r.id = report_id
        and r.article_id = article_id
        and r.reporter_user_id = auth.uid()
    )
  );

-- Keep article_id in sync with the report.
create or replace function public.article_report_replies_set_article()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select article_id into new.article_id
  from public.article_reports
  where id = new.report_id;

  if new.article_id is null then
    raise exception 'Report % not found.', new.report_id using errcode = 'P0002';
  end if;

  return new;
end;
$$;

drop trigger if exists article_report_replies_set_article on public.article_report_replies;
create trigger article_report_replies_set_article
  before insert on public.article_report_replies
  for each row execute function public.article_report_replies_set_article();
