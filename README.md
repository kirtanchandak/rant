# 🍻 Rant

A private, minimalist, and frictionless web application for dumping thoughts throughout the day. Designed for a quick "open, write, save, leave" flow with a warm cream/parchment aesthetic.

---

## ✨ Features

- **Parchment/Cream UI Theme** — Soft on the eyes, matching cozy journal apps (with a warm dark-mode alternative).
- **Auto-focused & Auto-resizing Editor** — Just open and start typing immediately.
- **Auto-save** — Automatically saves a backup every 5 seconds if you stop typing.
- **Keyboard Shortcuts** — Save quickly using `Cmd/Ctrl + Enter`.
- **Date-grouped Timeline** — Review all entries in reverse chronological order grouped by Today, Yesterday, or specific dates.
- **Responsive Monthly Calendar** — Days with entries show a small dot indicator. Click any date to list entries for that day.
- **Instant Search** — Full-text web-search (Supabase index powered) highlighting exact matches in real-time.
- **Secure Authentication** — Passwordless magic link authentication via Supabase.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router & Proxy)
- **Styling**: Tailwind CSS v4 + shadcn/ui (Sonner toasts & Lucide icons)
- **Theme**: `next-themes` (Warm Cream / Warm Dark Mode)
- **Database & Auth**: Supabase (PostgreSQL + Magic Link GoTrue Auth)

---

## 🚀 Getting Started

### 1. Environment Configuration

Clone `.env.local.example` to `.env.local` in the project root:

```bash
cp .env.local.example .env.local
```

Fill in your Supabase variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Database Setup

Paste the SQL schema from [db/schema.sql](file:///Users/kirtanchandak/developer/personal/rant/db/schema.sql) directly into your Supabase **SQL Editor** and run it. This creates the `entries` table, configures row-level security (RLS), and sets up the full-text search indexes.

### 3. Supabase Auth Configuration

Go to your Supabase Dashboard under **Authentication -> URL Configuration**:
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: Add `http://localhost:3000/auth/callback`

### 4. Running Locally

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see Rant in action.

---

## 📂 Project Structure

```
app/
  (app)/              # Auth-protected pages (Home/Write, Timeline, Calendar, Search)
  (auth)/             # Login page
  api/                # Search endpoint
  actions/            # Server actions for mutations & auth
components/           # Reusable UI components & layouts
db/                   # Database schemas
hooks/                # Custom utility hooks
lib/                  # Supabase clients & configuration helpers
proxy.ts              # Route protection middleware (Next.js 16)
```

---

## 📖 Definition of Done (V1)
- [x] Passwordless Magic Link authentication
- [x] Frictionless writing under 10 seconds
- [x] Timeline view with grouping and options to edit/delete
- [x] Live search across entries
- [x] Monthly calendar browsing
- [x] Responsive layout & togglable warm themes
