# LeadsDB — Leads Management Dashboard

A simple Leads Management UI where users can view, filter, search, and add leads — built as a frontend assignment.

---

## Tech Stack

- **Framework** — Next.js 15 (App Router)
- **Language** — TypeScript (strict, no `any`)
- **Styling** — Tailwind CSS
- **API** — Next.js API Routes
- **Storage** — JSON file (`data/leads.json`, auto-generated)
- **Font** — Geist via `next/font`

---

## How to Run

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> No database or environment setup needed. The data file `data/leads.json` is created automatically on first run from seed data.

---

## Project Structure

```
leads-dashboard/
├── app/
│   ├── page.tsx                  # Main dashboard
│   ├── layout.tsx
│   ├── globals.css
│   ├── leads/
│   │   └── [id]/
│   │       └── page.tsx          # Lead detail page
│   └── api/
│       └── leads/
│           ├── route.ts          # GET all leads + POST new lead
│           └── [id]/
│               └── route.ts      # PATCH lead status
├── components/
│   ├── LeadCard.tsx
│   ├── Modal.tsx
│   ├── StatusBadge.tsx
│   └── StatusSelector.tsx
├── data/
│   ├── leads.ts                  # Seed data
│   └── leads.json                # Runtime store (auto-generated)
├── lib/
│   └── store.ts                  # Read/write logic for leads.json
└── types/
    └── lead.ts                   # TypeScript types
```

---

## Features

### Part 1 — Leads List
- Fetches leads from `GET /api/leads`
- Displays leads in a card grid layout
- Each card shows: name, email, company, status badge, created date
- Loading skeleton while fetching
- Empty state when no leads match
- Error state if the fetch fails

### Part 2 — Filter & Search
- Real-time search across name, email, and company
- Filter by status via dropdown (All / New / Contacted / Qualified / Lost)
- Stat cards (New / Contacted / Qualified / Lost counts) are clickable — click to filter, click again to clear
- Sort by: Newest first, Oldest first, Name A→Z, Name Z→A, Company A→Z
- "Clear all filters" button shown when filters are active
- All filtering happens instantly via React state — no page reload

### Part 3 — Lead Detail Page
- Accessible via clicking any lead card (`/leads/[id]`)
- Shows all lead details: name, email, company, status, created date
- Status can be changed via a button group
- **Optimistic UI** — status updates instantly, rolls back if the API fails
- Inline feedback: "Saving…" while the request is in flight, "Status updated ✓" on success
- Page uses `force-dynamic` to always read the latest data from the store on load

### Part 4 — Add Lead Form
- Opens in a modal (ESC key or backdrop click to close)
- Controlled inputs with TypeScript-typed form state
- Validation:
  - All fields required
  - Valid email format check
  - Duplicate email check (returns 409 from the API)
- Server-side validation mirrors client-side validation
- New lead added to the top of the list immediately after creation
- Submit button shows a spinner while the request is in progress
- Success and error feedback shown inline in the modal

---

## Assumptions

1. **Mock API via Next.js API Routes** — `GET /api/leads`, `POST /api/leads`, and `PATCH /api/leads/[id]` are implemented as Next.js route handlers. Data is stored in `data/leads.json` so changes persist across server restarts without needing a real database.

2. **Add Lead form lives in a modal** on the dashboard rather than a separate `/leads/new` page. This avoids duplication since the assignment lists both a modal and a dedicated page as valid approaches — the modal pattern is cleaner for this scope.

3. **Lead type is kept minimal** — `id`, `name`, `email`, `company`, `status`, `createdAt` as specified in the assignment. No extra fields added.

4. **Optimistic UI on status change** — the status updates in the UI immediately on click without waiting for the API response. If the API call fails, the status rolls back to the previous value automatically.
