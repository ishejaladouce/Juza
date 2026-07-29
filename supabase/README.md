# Juza · Supabase

This folder holds the database schema, migrations, and any Supabase-specific config for Juza.

## Current status (verified)

With `.env` pointing at the Juza project, these tables respond over the REST API:

| Table | Status |
| --- | --- |
| `profiles` | live |
| `categories` | live (seeded) |
| `articles` | live (seed published rows) |
| `contributor_requests` | live |
| `article_reports` | live |
| `article_report_replies` | run `0008` if missing |
| `contact_messages` | run `0007` if missing |
| `article_follows` / `notifications` | run `0009` for follow + bell; run `0013` for author + request notices |
| Storage `avatars` | run `0014` for profile photo uploads |

The app uses **Supabase** whenever `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are set.

Demo (localStorage) is **opt-in only**: set `VITE_ALLOW_DEMO=true`. Without Supabase keys and without that flag, the app shows a setup screen.

## How to apply the schema (if starting fresh)

1. Create a new Supabase project (or use an existing empty one).
2. Open the **SQL Editor**.
3. Run in order:
   - [`migrations/0001_init.sql`](./migrations/0001_init.sql)
   - [`migrations/0002_seed_articles.sql`](./migrations/0002_seed_articles.sql)
   - [`migrations/0003_contributor_requests.sql`](./migrations/0003_contributor_requests.sql)
   - [`migrations/0004_review_and_reports.sql`](./migrations/0004_review_and_reports.sql)
   - [`migrations/0005_allow_sql_role_bootstrap.sql`](./migrations/0005_allow_sql_role_bootstrap.sql)
   - [`migrations/0006_seed_more_articles.sql`](./migrations/0006_seed_more_articles.sql)
   - [`migrations/0007_contact_messages.sql`](./migrations/0007_contact_messages.sql)
   - [`migrations/0008_report_replies.sql`](./migrations/0008_report_replies.sql)
   - [`migrations/0009_follows_and_notifications.sql`](./migrations/0009_follows_and_notifications.sql)
   - [`migrations/0010_contact_replies.sql`](./migrations/0010_contact_replies.sql)
   - [`migrations/0011_srs_account_feedback_settings.sql`](./migrations/0011_srs_account_feedback_settings.sql)
   - [`migrations/0012_seed_all_missing_articles.sql`](./migrations/0012_seed_all_missing_articles.sql) — run anytime to fill missing sample articles (safe to re-run)
   - [`migrations/0013_author_and_request_notifications.sql`](./migrations/0013_author_and_request_notifications.sql) — author approve/send-back notices + contributor request decisions
   - [`migrations/0014_avatar_storage.sql`](./migrations/0014_avatar_storage.sql) — profile photo storage bucket (`avatars`)

### Fix empty search for land / birth / business / etc.

If Browse shows a category but Search finds nothing for those topics, your DB is missing seed articles. Run **only**:

[`migrations/0012_seed_all_missing_articles.sql`](./migrations/0012_seed_all_missing_articles.sql)

in the SQL Editor. It recreates missing categories and inserts every sample article (EN / FR / RW) without duplicating existing ones.

4. Copy URL + **legacy anon** JWT from **Project Settings → API** into `.env`:

   ```bash
   VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   VITE_SITE_URL=http://localhost:5173
   ```

5. Restart `npm run dev`.

## Auth checklist (do this next)

In the Supabase dashboard → **Authentication → URL configuration**:

- **Site URL:** `http://localhost:5173`
- **Redirect URLs:** add `http://localhost:5173/**`, `http://localhost:5173/login`, and `http://localhost:5173/reset-password`

Email confirmations redirect to `${VITE_SITE_URL}/login`.

## First admin account

Create this user once in the Supabase dashboard, then promote with SQL.

**Recommended credentials**

| Field | Value |
| --- | --- |
| Email | `admin@gmail.com` |
| Password | `admin@1234` |

### 1. Create the user

Supabase dashboard → **Authentication** → **Users** → **Add user** → **Create new user**

- Email: `admin@gmail.com`
- Password: `admin@1234`
- Enable **Auto Confirm User** (so you can sign in immediately)

### 2. Promote to admin

SQL Editor → run (replace the email if needed):

```sql
-- One-time: allow SQL Editor to set the first admin
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if new.role is distinct from old.role and not public.is_admin(auth.uid()) then
    raise exception 'only admins can change a user role';
  end if;
  return new;
end;
$$;

update public.profiles
set role = 'admin',
    full_name = coalesce(full_name, 'Juza Admin')
where id = (
  select id from auth.users
  where email = 'admin@gmail.com'
);
```

If the update says **0 rows**, the user doesn't exist yet — create them under **Authentication → Users** first.


### 3. Sign in

App → [Sign in to admin](/login?next=/admin)  
or open `/login?next=/admin` and use the email/password above.

After that you should see **Admin** in the header.


## What the schema contains

| Table | What it stores |
| --- | --- |
| `profiles` | One row per `auth.users` row. Role: `citizen` / `contributor` / `admin`. |
| `categories` | Civic categories with `name_{en,fr,rw}` and descriptions. |
| `articles` | One row per (article, language). Translations share `translation_group_id`. |
| `saved_articles` | Bookmarks. |
| `contributor_requests` | Citizen → contributor approval queue. |
| `article_reports` | Reader reports for moderation. |

## Roles

- Signup always creates **citizen**.
- **Contributor** only via admin-approved request.
- **Admin** only via SQL promote (or another admin changing roles).
- Contributors cannot self-publish: `draft` → `in_review` → admin approve.

## Full-text search

`articles.search_tsv` + GIN index powers search when Supabase is configured.
