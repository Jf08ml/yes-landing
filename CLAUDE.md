# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Dev server (uses Turbopack)
npm run build    # Production build
npm run lint     # ESLint
npm start        # Production server (after build)
```

No test suite is configured.

## Architecture

**Next.js 15 App Router** landing site + lightweight CMS for YES Institute (language school in Neiva, Colombia). Deployed to Vercel.

### Data flow

All content lives in **Firestore** under two collections:

- `siteConfig/{home,courses,contact,yesFactor,blogContent}` — structured site content (public read, admin-only write)
- `blogPosts/{id}` — blog articles with Markdown content (public read, admin-only write)
- `leads/{id}` — form submissions (write-only for public, admin read)

Pages use **ISR with `revalidate = 300`** (5 min). All server components call helpers from `src/lib/content.ts`, which fetch from Firestore and **fall back to `src/lib/mockData.ts`** when Firebase is not configured or a document doesn't exist. This means the app always compiles and renders locally without `.env.local`.

### Firebase setup

`src/lib/firebase.ts` exports `isFirebaseConfigured` (boolean), `auth`, `db`, and `storage`. All are `null` when env vars are missing. Always guard with `if (!db)` before using them.

The **admin allowlist** is hardcoded in `firestore.rules` — add admin emails there when creating new admin users.

### Admin panel (`/admin`)

Client component using Firebase Auth (email/password). Reads/writes Firestore directly from the browser. The "Sembrar datos" button seeds all `siteConfig` documents + `mockBlogPosts` from `mockData.ts`, overwriting existing data.

### Leads API (`/api/leads`)

Route handler that validates input, optionally verifies a Cloudflare Turnstile token, then writes to the `leads` collection. Uses dynamic `import()` for Firebase to avoid bundle issues.

### Adding a new content section

1. Add the TypeScript interface to `src/types/index.ts`
2. Add mock data to `src/lib/mockData.ts`
3. Add a `fetchXxx` helper to `src/lib/content.ts` using `fetchDoc()`
4. Add the Firestore document `siteConfig/xxx`
5. Add editor UI in `src/app/admin/page.tsx`

### Key constraints

- **No Admin SDK / service accounts** — only Firebase client SDK, even in route handlers
- **No on-demand revalidation** — ISR 5-min cache is the content update mechanism
- **Images** must come from `firebasestorage.googleapis.com` or `images.unsplash.com` (configured in `next.config.ts`)
- **Tailwind v4** — uses `@tailwindcss/postcss`, configured via `next.config.ts` alias for Turbopack compatibility
