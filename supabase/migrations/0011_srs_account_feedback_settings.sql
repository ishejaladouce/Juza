-- 0011_srs_account_feedback_settings.sql
-- Account status, email preference, question reports, onboarding flag.

alter table public.profiles
  add column if not exists account_status text not null default 'active'
    check (account_status in ('active', 'suspended', 'removed'));

alter table public.profiles
  add column if not exists email_notifications boolean not null default false;

alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz;

create index if not exists profiles_account_status_idx
  on public.profiles (account_status);

-- Add "question" as a report reason.
do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'article_report_reason'
      and e.enumlabel = 'question'
  ) then
    alter type public.article_report_reason add value 'question';
  end if;
end $$;

-- Block self-changes to role and account_status.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- No session → SQL Editor / service role.
  if auth.uid() is null then
    return new;
  end if;

  if not public.is_admin() then
    if new.role is distinct from old.role then
      raise exception 'Only admins can change roles.';
    end if;
    if new.account_status is distinct from old.account_status then
      raise exception 'Only admins can change account status.';
    end if;
  end if;

  return new;
end;
$$;

-- Admin: set account status.
create or replace function public.set_account_status(
  p_user_id uuid,
  p_status text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.profiles;
begin
  if not public.is_admin() then
    raise exception 'Only admins can change account status.';
  end if;

  if p_status not in ('active', 'suspended', 'removed') then
    raise exception 'Invalid account status.';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'You cannot change your own account status.';
  end if;

  update public.profiles
  set
    account_status = p_status,
    updated_at = now()
  where id = p_user_id
  returning * into row;

  if row.id is null then
    raise exception 'User not found.';
  end if;

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'notifications'
  ) then
    if p_status = 'suspended' then
      insert into public.notifications (user_id, kind, title, body, link)
      values (
        p_user_id,
        'system',
        'Your account has been suspended',
        'An administrator suspended your Juza account. Contact support if you think this is a mistake.',
        '/contact'
      );
    elsif p_status = 'active' then
      insert into public.notifications (user_id, kind, title, body, link)
      values (
        p_user_id,
        'system',
        'Your account is active again',
        'An administrator restored your Juza account.',
        '/dashboard'
      );
    end if;
  end if;

  return row;
end;
$$;

revoke all on function public.set_account_status(uuid, text) from public;
grant execute on function public.set_account_status(uuid, text) to authenticated;
