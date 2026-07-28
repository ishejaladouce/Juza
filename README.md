# Juza

Juza (Kiswahili for “to inform”) is a civic information platform for Rwanda and East Africa. Citizens can find rights, rules, and public services in plain language, in English, French, and Kinyarwanda.

**Live demo:** [ ] 
**Repository:** keep this GitHub repo **public** so markers can open it.

This repository is the web app (React + TypeScript). Authentication and data use [Supabase](https://supabase.com) (Auth + Postgres + Row Level Security). There is no separate Express or Prisma API.


## Features

| Who | What they can do |
| --- | --- |
| Visitor | Browse categories, search articles, switch language (EN / FR / RW), read Help/FAQ, send a contact message |
| Citizen | Create an account, choose preferred language, save bookmarks, follow articles (in-app notifications), flag outdated content, ask a question on an article, track feedback status, read contact replies, optional email-alert preference in Settings, apply to become a contributor |
| Contributor | Add, update, and remove draft articles; submit articles for review |
| Admin | Manage categories and users (change roles, suspend, remove), approve contributors, review and publish articles, handle reports and contact replies, view platform activity |

Password reset uses Supabase Auth email. Follow updates and contact replies also appear in the in-app notification bell when signed in.


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
12. `0012_seed_all_missing_articles.sql` (fills any missing sample articles — safe to re-run)

If search finds categories but not topics like land / birth certificate / business, run **only** `0012_seed_all_missing_articles.sql` once in the SQL Editor.


## Auth URLs (required)

Supabase → **Authentication** → **URL configuration**:

| Setting | Local development |
| --- | --- |
| Site URL | `http://localhost:5173` |
| Redirect URLs | `http://localhost:5173/**`, `http://localhost:5173/login`, `http://localhost:5173/reset-password` |

After you deploy, replace these with your production URL the same way.


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

Markers need a URL that works on the public internet.

1. Push this project to a **public** GitHub repository.
2. Import the repo on [Vercel](https://vercel.com) (framework: Vite).
3. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SITE_URL` = your Vercel URL (for example `https://your-app.vercel.app`)
4. In Supabase, set **Site URL** and **Redirect URLs** to that same production origin (include `/login` and `/reset-password`).
5. Deploy.

- Build command: `npm run build`  
- Output directory: `dist`

After deploy, paste the live URL at the top of this README under **Live demo**.

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


