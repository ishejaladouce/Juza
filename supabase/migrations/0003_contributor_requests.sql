-- 0003_contributor_requests.sql
-- Citizens apply to become contributors.

do $$ begin
  create type public.contributor_request_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.contributor_requests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  reason        text not null check (char_length(btrim(reason)) >= 20),
  status        public.contributor_request_status not null default 'pending',
  admin_note    text,
  reviewed_by   uuid references public.profiles(id) on delete set null,
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index if not exists contributor_requests_one_pending_per_user
  on public.contributor_requests (user_id)
  where status = 'pending';

create index if not exists contributor_requests_status_idx
  on public.contributor_requests (status, created_at desc);

drop trigger if exists contributor_requests_set_updated_at on public.contributor_requests;
create trigger contributor_requests_set_updated_at
  before update on public.contributor_requests
  for each row execute function public.set_updated_at();

alter table public.contributor_requests enable row level security;

drop policy if exists "requests self read" on public.contributor_requests;
create policy "requests self read"
  on public.contributor_requests
  for select
  using (auth.uid() = user_id);

drop policy if exists "requests admin read" on public.contributor_requests;
create policy "requests admin read"
  on public.contributor_requests
  for select
  using (public.is_admin());

drop policy if exists "requests self insert" on public.contributor_requests;
create policy "requests self insert"
  on public.contributor_requests
  for insert
  with check (
    auth.uid() = user_id
    and status = 'pending'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'citizen'
    )
  );

drop policy if exists "requests admin update" on public.contributor_requests;
create policy "requests admin update"
  on public.contributor_requests
  for update
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.approve_contributor_request(request_id uuid)
returns public.contributor_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  reviewer uuid := auth.uid();
  req public.contributor_requests;
begin
  if not public.is_admin(reviewer) then
    raise exception 'Only admins can approve contributor requests.'
      using errcode = '42501';
  end if;

  select * into req
  from public.contributor_requests
  where id = request_id
  for update;

  if not found then
    raise exception 'Request % not found.', request_id using errcode = 'P0002';
  end if;

  if req.status <> 'pending' then
    raise exception 'Request % is already %.', request_id, req.status
      using errcode = '22023';
  end if;

  update public.profiles
     set role = 'contributor',
         updated_at = now()
   where id = req.user_id;

  update public.contributor_requests
     set status = 'approved',
         reviewed_by = reviewer,
         reviewed_at = now(),
         admin_note = null,
         updated_at = now()
   where id = request_id
   returning * into req;

  return req;
end;
$$;

revoke all on function public.approve_contributor_request(uuid) from public;
grant execute on function public.approve_contributor_request(uuid) to authenticated;
