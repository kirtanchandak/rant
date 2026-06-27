# Rant – MVP Plan

## Goal

Build a minimal web application where users can quickly dump thoughts throughout the day.

The app should feel frictionless—open it, write, save, leave.

**No AI in V1.**

---

# Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
  - Authentication
  - PostgreSQL
- Vercel

---

# Core Features

## Authentication

- Magic link supabse signin

---

# Home Page

After login:

```
Good afternoon, Kirtan.

What's on your mind today?

+--------------------------------------+
|                                      |
|                                      |
|                                      |
+--------------------------------------+

                [ Save Entry ]
```

Requirements:

- Large textarea
- Focus cursor automatically
- Markdown supported (plain textarea is fine)
- Save button
- `Cmd/Ctrl + Enter` to save
- Optional autosave every few seconds

---

# Timeline

Display entries in reverse chronological order.

Example:

```
Today

📝 11:34 AM
Worked on MCP ideas...

────────────────────────────

📝 8:12 AM
Need to rethink my product idea...

Yesterday

📝 7:15 PM
Gym felt amazing today.
```

Requirements:

- Infinite scroll (optional)
- Click entry to view
- Edit entry
- Delete entry

---

# Entry Page

Display:

- Date
- Time
- Markdown rendering
- Edit
- Delete

---

# Calendar View

Monthly calendar.

Requirements:

- Days with entries show a small dot
- Clicking a date displays all entries for that day

Nothing fancy.

---

# Search

Simple full-text search.

Search across all journal content.

No AI search.

---

# Database Schema

## entries

| Column | Type |
|----------|------|
| id | UUID |
| user_id | UUID |
| content | TEXT |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

# UI Style

Minimal.

Inspired by:

- Apple Notes
- Reflect
- Linear

Principles:

- Lots of whitespace
- Fast
- Keyboard-first
- Dark mode
- Responsive
- Zero distractions

---

# Nice UX

- Auto focus textarea
- Cmd/Ctrl + Enter → Save
- Toast after save
- Loading states
- Empty state
- Smooth transitions

---

# Folder Structure

```
app/

components/

lib/

hooks/

db/

types/

ai/
```

Create the `ai/` folder but leave it empty for now.

---

# Future AI Features (Do NOT Implement)

## Weekly Summary

```
Summarize everything I wrote this week.
```

---

## Monthly Reflection

```
What themes appeared this month?

What changed?

What goals am I progressing on?
```

---

## Year Review

```
How did I change this year?

What ideas survived?

What habits formed?
```

---

## Ask Your Journal

Examples:

```
What was I working on in March?

When did I first mention MCP?

Show every time I talked about burnout.

What ideas keep resurfacing?
```

---

## Pattern Detection

Potential future insights:

- Recurring projects
- Frequently mentioned people
- Mood trends
- Goals
- Habits
- Idea clusters
- Personal growth timeline

---

# Non Goals

Do **NOT** build:

- AI chat
- Embeddings
- Tags
- Categories
- Mood tracking
- Streaks
- Notifications
- Images
- Attachments
- Sharing
- Rich text editor
- Collaboration
- Payments
- Teams

Keep the MVP extremely focused.

---

# Definition of Done

By the end of today I should be able to:

- Sign in
- Write a journal entry in under 10 seconds
- Save it
- See it in the timeline
- Edit it
- Delete it
- Browse entries using a calendar
- Search previous entries
- Deploy to Vercel

---

# Guiding Principle

This is **not** an AI product yet.

It is a fast, beautiful journaling app that collects high-quality personal data.

The AI layer comes later, once enough journal history exists to generate meaningful insights.