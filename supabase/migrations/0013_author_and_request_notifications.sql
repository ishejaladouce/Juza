-- 0013_author_and_request_notifications.sql
-- In-app notices for authors (approve / send-back / unpublish)
-- and for contributor request decisions.

-- Allow new notification kinds.
alter table public.notifications drop constraint if exists notifications_kind_check;
alter table public.notifications
  add constraint notifications_kind_check
  check (kind in (
    'article_updated',
    'article_published',
    'article_approved',
    'article_sent_back',
    'system',
    'contact_reply',
    'contributor_approved',
    'contributor_rejected'
  ));

-- Notify the author when review outcome or unpublish changes status.
create or replace function public.notify_author_on_article_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op <> 'UPDATE' then
    return new;
  end if;

  if new.author_id is null then
    return new;
  end if;

  -- Approved / published from review.
  if old.status = 'in_review' and new.status = 'published' then
    insert into public.notifications (user_id, article_id, kind, title, body, link)
    values (
      new.author_id,
      new.id,
      'article_approved',
      'Your article was approved',
      new.title,
      '/article/' || new.slug
    );
    return new;
  end if;

  -- Sent back for edits.
  if old.status = 'in_review' and new.status = 'draft' then
    insert into public.notifications (user_id, article_id, kind, title, body, link)
    values (
      new.author_id,
      new.id,
      'article_sent_back',
      'Your article needs changes',
      coalesce(nullif(trim(new.review_note), ''), new.title),
      '/dashboard/articles/' || new.id
    );
    return new;
  end if;

  -- Unpublished (e.g. after a report).
  if old.status = 'published' and new.status = 'draft' then
    insert into public.notifications (user_id, article_id, kind, title, body, link)
    values (
      new.author_id,
      new.id,
      'system',
      'Your article was unpublished',
      new.title,
      '/dashboard/articles/' || new.id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists articles_notify_author on public.articles;
create trigger articles_notify_author
  after update on public.articles
  for each row execute function public.notify_author_on_article_status();

-- Notify applicant when contributor request is approved.
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

  insert into public.notifications (user_id, article_id, kind, title, body, link)
  values (
    req.user_id,
    null,
    'contributor_approved',
    'You are now a contributor',
    'An administrator approved your request. You can write and submit articles.',
    '/dashboard'
  );

  return req;
end;
$$;

-- Reject request and notify applicant.
create or replace function public.reject_contributor_request(
  request_id uuid,
  admin_note text
)
returns public.contributor_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  reviewer uuid := auth.uid();
  req public.contributor_requests;
  cleaned text := trim(coalesce(admin_note, ''));
begin
  if not public.is_admin(reviewer) then
    raise exception 'Only admins can reject contributor requests.'
      using errcode = '42501';
  end if;

  if char_length(cleaned) < 1 then
    raise exception 'Please add a short note so the applicant understands.'
      using errcode = '22023';
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

  update public.contributor_requests
     set status = 'rejected',
         reviewed_by = reviewer,
         reviewed_at = now(),
         admin_note = cleaned,
         updated_at = now()
   where id = request_id
   returning * into req;

  insert into public.notifications (user_id, article_id, kind, title, body, link)
  values (
    req.user_id,
    null,
    'contributor_rejected',
    'Contributor request not approved',
    cleaned,
    '/dashboard'
  );

  return req;
end;
$$;

revoke all on function public.approve_contributor_request(uuid) from public;
grant execute on function public.approve_contributor_request(uuid) to authenticated;

revoke all on function public.reject_contributor_request(uuid, text) from public;
grant execute on function public.reject_contributor_request(uuid, text) to authenticated;
