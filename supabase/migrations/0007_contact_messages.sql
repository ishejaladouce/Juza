-- 0007_contact_messages.sql
-- Contact form messages for admins.

create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text,
  message     text not null,
  status      text not null default 'open'
                check (status in ('open', 'closed')),
  created_at  timestamptz not null default now()
);

create index if not exists contact_messages_status_created_idx
  on public.contact_messages (status, created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "contact insert anyone" on public.contact_messages;
create policy "contact insert anyone"
  on public.contact_messages
  for insert
  with check (
    char_length(trim(name)) >= 2
    and char_length(trim(email)) >= 5
    and char_length(trim(message)) >= 10
    and char_length(coalesce(message, '')) <= 4000
  );

drop policy if exists "contact admin read" on public.contact_messages;
create policy "contact admin read"
  on public.contact_messages
  for select
  using (public.is_admin());

drop policy if exists "contact admin update" on public.contact_messages;
create policy "contact admin update"
  on public.contact_messages
  for update
  using (public.is_admin())
  with check (public.is_admin());
