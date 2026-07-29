# Juza

Juza (Kiswahili for “to inform”) is a civic information platform for Rwanda and East Africa. Citizens can find rights, rules, and public services in plain language, in English, French, and Kinyarwanda.

This repository is the web app (React + TypeScript). Authentication and data use [Supabase](https://supabase.com) (Auth + Postgres + Row Level Security + Storage). There is no separate Express or Prisma API.

## Links

| Item | URL |
| --- | --- |
| Live demo | https://juza.vercel.app |
| GitHub repository | https://github.com/ishejaladouce/Juza |

Keep the GitHub repo **public**.


## Features

| Who | What they can do |
| --- | --- |
| Visitor | Browse categories, search articles, switch language (EN / FR / RW), read Help/FAQ, send a contact message |
| Citizen | Create an account, set preferred language, upload a profile photo, save bookmarks, follow articles, receive in-app notifications, flag outdated content, ask a question on an article, track feedback, read contact replies, apply to become a contributor |
| Contributor | Add, update, and remove draft articles; submit articles for review; get notified when an article is approved, sent back, or unpublished |
| Admin | Manage categories and users (roles, suspend, remove), approve or reject contributor requests (applicant is notified), review and publish or send back articles, handle reports and contact replies, view platform activity |

Password reset uses Supabase Auth email. In-app notification bell covers follows, contact replies, account suspend/restore, article review outcomes for authors, and contributor request decisions.


## Requirements

- [Node.js](https://nodejs.org/) 18 or newer
- npm (comes with Node)
- A free [Supabase](https://supabase.com) project (for the full live backend)


## Quick start

```bash
git clone https://github.com/ishejaladouce/Juza.git
cd Juza
npm install
cp .env.example .env
```

Edit `.env`:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=http://localhost:5173
```

Get the URL and anon key from Supabase → **Project Settings** → **API**.

Optional: set `VITE_ALLOW_DEMO=true` and leave the Supabase keys empty to run offline with localStorage demo data. When real Supabase keys are present, the app uses Supabase only.


## Database setup

Open Supabase → **SQL Editor**. Run every file in `supabase/migrations/` **in this order**:

1. `0001_init.sql`
2. `0002_seed_articles.sql`
3. `0003_contributor_requests.sql`
4. `0004_review_and_reports.sql`
5. `0005_allow_sql_role_bootstrap.sql`
6. `0006_seed_more_articles.sql`
7. `0007_contact_messages.sql`
8. `0008_report_replies.sql`
9. `0009_follows_and_notifications.sql`
10. `0010_contact_replies.sql`
11. `0011_srs_account_feedback_settings.sql`
12. `0012_seed_all_missing_articles.sql` (fills missing sample articles — safe to re-run)
13. `0013_author_and_request_notifications.sql` (author + contributor-request in-app notices)
14. `0014_avatar_storage.sql` (profile photo Storage bucket `avatars`)

If search finds categories but not topics like land / birth certificate / business, run **only** `0012_seed_all_missing_articles.sql` once.


## Auth URLs (required)

Supabase → **Authentication** → **URL configuration**:

| Setting | Local development | Production (after deploy) |
| --- | --- | --- |
| Site URL | `http://localhost:5173` | `https://juza.vercel.app` |
| Redirect URLs | `http://localhost:5173/**`, `/login`, `/reset-password` | `https://juza.vercel.app/**`, `/login`, `/reset-password` |

If your Vercel URL differs, use that origin instead of `juza.vercel.app`.


## Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | TypeScript check only |
| `npm run lint` | ESLint |


## First admin account

1. Supabase → **Authentication** → **Users** → **Add user**
   - Email example: `admin@juza.com`
   - Choose a strong password
   - Enable **Auto Confirm User**

2. Run this in the **SQL Editor** (change the email if needed). Migration `0005` must already be applied:

```sql
update public.profiles
set role = 'admin',
    full_name = coalesce(full_name, 'Juza Admin')
where id = (
  select id from auth.users
  where email = 'admin@juza.com'
);
```

If the update changes **0 rows**, create the Auth user first, then run the SQL again.

3. Sign in at `/login` (or `/login?next=/admin`). Open **Admin** from the header.


## Deploy (public URL)

1. Push this project to a **public** GitHub repository.
2. Import the repo on [Vercel](https://vercel.com) (framework: Vite).
3. Set environment variables (Production + Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SITE_URL` = your live URL (example: `https://juza.vercel.app`)
4. In Supabase, set **Site URL** and **Redirect URLs** to that production origin.
5. Deploy, then update the **Live demo** row in the Links table above if the URL changed.

- Build command: `npm run build`
- Output directory: `dist`


## Project structure

```
Juza/
├── public/                  Static files
├── src/
│   ├── components/          Shared UI (layout, forms, notifications)
│   ├── demo/                Optional offline demo store
│   ├── hooks/               Auth and helpers
│   ├── i18n/                Language config
│   ├── locales/             en, fr, rw strings
│   ├── lib/data/            Supabase / demo data access
│   ├── pages/               App screens (citizen, contributor, admin)
│   └── styles/              Global CSS and design tokens
├── supabase/migrations/     Database schema and seed SQL
├── .env.example             Environment template (do not commit real .env)
└── README.md
```


## Design notes

Colours and type live in `src/styles/globals.css`. Accent colour is forest green. Display font: Newsreader. UI font: Source Sans 3. Article body: Source Serif 4.

The UI uses semantic landmarks, a skip link, visible focus styles, and `aria-label`s on icon-only controls. `<html lang>` follows the active language.
