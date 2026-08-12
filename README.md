# Internal Portal

A small internal portal: login-gated, with a **Deploy Log** as the one content
section — team members can post a deploy entry (title, description, severity),
see it appear on a timeline immediately, filter/sort it, and delete it later
if needed.

## Setup / run

```bash
npm install
cp .env.example .env          # then edit NEXTAUTH_SECRET (see below)
npx prisma migrate dev         # creates prisma/dev.db and applies the schema
npm run db:seed                # creates a demo user + a few sample entries
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/login`.

Demo login: `demo@example.com` / `password123`

Generate a real `NEXTAUTH_SECRET` for anything beyond local testing:

```bash
openssl rand -base64 32
```

## Stack & key decisions

**NextAuth (Credentials provider) + Prisma/SQLite.** Both were chosen for
the same reason: fastest path to a fully working, self-contained app for a
take-home. SQLite needs no external database server or hosted instance —
`npx prisma migrate dev` gets a evaluator running in one command. NextAuth's
Credentials provider avoids setting up an OAuth app just to demo a login
flow; passwords are hashed with bcrypt before being stored.

**Two layers of auth enforcement, not just one:**

- `proxy.ts` (Next.js 16 renamed Middleware → Proxy) does a fast, optimistic
  JWT check and redirects unauthenticated requests to `/login` before they
  reach `/deploy-log`.
- Every API route (`app/api/deploy-entries/route.ts`) independently calls
  `auth()` and returns `401` if there's no session, *regardless of what the
  proxy already did*. Proxy checks run against a decoded JWT and are
  explicitly documented by Next.js as unsuitable as the sole authorization
  mechanism — they're an optimistic UX check, not a security boundary. A
  request can reach an API route directly (curl, a compromised client, a
  future route that forgets to sit under the proxy's matcher), so the route
  itself has to be the actual gate. This is also why the deploy-log *page*
  fetches data with a direct Prisma call rather than trusting the proxy
  alone — the source of truth for "is this data safe to return" always
  lives next to the data access, not in a request-routing layer.

**Server component + direct Prisma call for the list, client component +
`fetch` for the form.** The list is read-only and can be rendered on the
server with no client-side JS; going through `/api/deploy-entries` for that
would be an unnecessary network hop to hit the same database from the same
process. The form needs interactivity (controlled inputs, loading state,
inline errors) so it's a client component that POSTs to the API route and
calls `router.refresh()` on success, which re-runs the server component and
picks up the new row — no separate client-side cache to keep in sync.

**Validation with `zod` on the API route**, returning `400` with field-level
errors on failure, `401` on no session, `201` on success. Delete
(`DELETE /api/deploy-entries/[id]`) follows the same pattern: `401` with no
session, `404` if the entry is already gone, `200` on success.

**Any authenticated user can delete any entry**, not just their own. The
deploy log is treated as shared team state (like a shared changelog), not
per-user private data, so no ownership check was added — a deliberate
simplicity choice, not an oversight. Both delete and logout require an
explicit confirmation click (via an `AlertDialog`) before anything happens,
since both are destructive/disruptive and hard to undo from the UI.

## Scope cuts

- **No edit, no pagination.** The task asked for create + view done well
  over several half-built features; delete was added afterward but editing
  and pagination don't add much at seed-data scale. Both are reasonable
  "next steps."
- **Single demo user, no signup flow.** Login only — there's no self-serve
  registration UI. New users are seeded directly.
- **One combined proxy-level redirect + form error message**, not granular
  per-field auth error states.

## Known limitation: SQLite on Vercel

Vercel's serverless functions have an ephemeral filesystem, so a SQLite file
written at runtime won't persist between requests/deploys. Locally this is a
non-issue. For a real deployed instance, swap the Prisma datasource to
Vercel Postgres (or any hosted Postgres) — the schema and queries don't
change, only `datasource.provider` and `DATABASE_URL`.

## Deploying

1. Push to GitHub.
2. Import the repo in Vercel.
3. Set env vars: `NEXTAUTH_SECRET`, `DATABASE_URL` (point this at a hosted
   Postgres if you want the deployed version to actually persist writes —
   see above).
4. Deploy.
