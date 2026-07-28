-- 0010_contact_replies.sql
-- Admin replies on contact messages; citizens get an in-app notice.

alter table public.contact_messages
  add column if not exists user_id uuid references public.profiles(id) on delete set null;

alter table public.contact_messages
  add column if not exists admin_reply text;

alter table public.contact_messages
  add column if not exists replied_at timestamptz;

alter table public.contact_messages
  add column if not exists replied_by uuid references public.profiles(id) on delete set null;

create index if not exists contact_messages_user_idx
  on public.contact_messages (user_id, created_at desc)
  where user_id is not null;

-- Citizens can read their own messages.
drop policy if exists "contact read own" on public.contact_messages;
create policy "contact read own"
  on public.contact_messages
  for select
  using (auth.uid() is not null and auth.uid() = user_id);

-- Allow contact_reply notification kind (needs 0009).
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'notifications'
  ) then
    alter table public.notifications drop constraint if exists notifications_kind_check;
    alter table public.notifications
      add constraint notifications_kind_check
      check (kind in ('article_updated', 'article_published', 'system', 'contact_reply'));
  end if;
end $$;

-- Reply and notify the linked citizen.
create or replace function public.reply_to_contact_message(
  p_message_id uuid,
  p_reply text
)
returns public.contact_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.contact_messages;
  cleaned text := trim(p_reply);
begin
  if not public.is_admin() then
    raise exception 'Only admins can reply to contact messages.';
  end if;

  if char_length(cleaned) < 2 then
    raise exception 'Reply is too short.';
  end if;

  if char_length(cleaned) > 4000 then
    raise exception 'Reply is too long.';
  end if;

  update public.contact_messages
  set
    admin_reply = cleaned,
    replied_at = now(),
    replied_by = auth.uid(),
    status = 'closed'
  where id = p_message_id
  returning * into row;

  if row.id is null then
    raise exception 'Contact message not found.';
  end if;

  if row.user_id is not null then
    insert into public.notifications (user_id, kind, title, body, link)
    values (
      row.user_id,
      'contact_reply',
      'Reply to your message',
      left(cleaned, 180),
      '/dashboard/messages'
    );
  end if;

  return row;
end;
$$;

revoke all on function public.reply_to_contact_message(uuid, text) from public;
grant execute on function public.reply_to_contact_message(uuid, text) to authenticated;
