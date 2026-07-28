-- Bootstrap role changes from SQL Editor / service role.
-- App users still cannot self-promote.

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

  if new.role is distinct from old.role and not public.is_admin(auth.uid()) then
    raise exception 'only admins can change a user role';
  end if;

  return new;
end;
$$;
