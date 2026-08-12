# Internal Portal

A small internal portal: login-gated, with a **Deploy Log** as the core
content section — team members post a deploy entry (title, description,
severity), see it appear on a timeline immediately, filter/search/sort it,
and delete it later if needed. Three more real (not placeholder) sections
round out the app: **Revision History** (an audit trail of every create/
delete), **Overview** (release stats), and **Team** (registered users).

**Live**: https://internal-portal-one-livid.vercel.app
Demo login: `demo@example.com` / `password123`

## Setup / run

```bash
npm install
cp .env.example .env          # fill in DATABASE_URL and NEXTAUTH_SECRET (see below)
npx prisma migrate dev        # applies the schema to your Postgres database
npm run db:seed               # creates a demo user + a few sample entries
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/login`.

`DATABASE_URL` needs a real Postgres connection string. The free path: create
a project at [neon.tech](https://neon.tech) (or use Vercel's Storage tab →
Connect Database → Neon, which provisions one and wires up env vars for you)
and copy the pooled connection string.

Generate a real `NEXTAUTH_SECRET` for anything beyond local testing:

```bash
openssl rand -base64 32
```

## Stack & key decisions

**NextAuth (Credentials provider) + Prisma/Postgres (Neon).** NextAuth's
Credentials provider avoids setting up an OAuth app just to demo a login
flow; passwords are hashed with bcrypt before being stored. The project
started on SQLite for fast local setup, then moved to Neon Postgres once it
needed a real deployment — Vercel's serverless functions have an ephemeral
filesystem, so a SQLite file written at runtime doesn't survive between
requests. Neon was chosen over something like AWS RDS specifically because
it's built for serverless: connection pooling is built in, which matters a
lot here since every function invocation can otherwise open a fresh
connection and exhaust a traditional Postgres instance's connection limit
fast. RDS would need RDS Proxy bolted on to get the same behavior.

**Two layers of auth enforcement, not just one:**

- `proxy.ts` (Next.js 16 renamed Middleware → Proxy) does a fast, optimistic
  JWT check and redirects unauthenticated requests to `/login` before they
  reach any protected page. It reads the session via `getToken()` with
  `secureCookie` explicitly derived from `NODE_ENV` — NextAuth sets the
  `__Secure-`-prefixed session cookie whenever the app is served over HTTPS
  (i.e. in production), and `getToken()` defaults `secureCookie` to `false`,
  so without this the proxy looks for the wrong cookie name and treats
  logged-in users as logged out. This only surfaced when testing the actual
  deployed app, not locally over HTTP — worth knowing if you fork this.
- Every API route independently calls `auth()` and returns `401` if there's
  no session, *regardless of what the proxy already did*. Proxy checks are
  explicitly documented by Next.js as unsuitable as the sole authorization
  mechanism — they're an optimistic UX check, not a security boundary. A
  request can reach an API route directly (curl, a compromised client, a
  future route that forgets to sit under the proxy's matcher), so the route
  itself has to be the actual gate. This is also why every data-fetching
  *page* reads with a direct Prisma call rather than trusting the proxy
  alone — the source of truth for "is this data safe to return" always
  lives next to the data access, not in a request-routing layer.

**Server component + direct Prisma call for the list, client component +
`fetch` for the form.** The list is read-only and can be rendered on the
server with no client-side JS; going through the API for that would be an
unnecessary network hop to hit the same database from the same process. The
form needs interactivity (controlled inputs, loading state, inline errors)
so it's a client component that POSTs to the API route and calls
`router.refresh()` on success, which re-runs the server component and picks
up the new row — no separate client-side cache to keep in sync.

**Validation with `zod` on the API route** (shared in `lib/validations.ts`,
covered by unit tests), returning `400` with field-level errors on failure,
`401` on no session, `201` on success. Delete
(`DELETE /api/deploy-entries/[id]`) follows the same pattern: `401` with no
session, `404` if the entry is already gone, `200` on success.

**Any authenticated user can delete any entry**, not just their own. The
deploy log is treated as shared team state (like a shared changelog), not
per-user private data, so no ownership check was added — a deliberate
simplicity choice, not an oversight. Both delete and logout require an
explicit confirmation click (via an `AlertDialog`) before anything happens.

**Revision History is a real audit trail**, not the same data reshaped. A
separate `ActivityLog` table records CREATED/DELETED events with a
denormalized snapshot of the entry (title, severity, actor) rather than a
foreign key to `DeployEntry` — so a record survives the entry it describes
being deleted, which is the entire point of an audit log.

## Testing

```bash
npm run test
```

Unit tests (Vitest) cover the pure logic that's actually worth getting
right: the zod validation schema (`lib/validations.ts`) and the deploy-log
filter/sort/"since last major release" calculations (`lib/deploy-log.ts`).
Deliberately scoped light — no database or browser involved, so it runs in
under a second and has no flaky external dependencies. API-route and
end-to-end coverage were left out as a reasonable "next step" rather than
scope creep for a take-home.

## CI/CD

- **CI** (`.github/workflows/ci.yml`, GitHub Actions): every push and PR to
  `main` runs lint, `tsc --noEmit`, the unit tests, and a production
  `next build` — using dummy env vars, since nothing in the build touches a
  real database (every data-fetching page is `force-dynamic`, so Prisma
  calls only happen at request time, never at build time).
- **CD** (Vercel): the GitHub repo is connected directly to the Vercel
  project, so every push to `main` triggers an automatic production
  deployment — no GitHub Actions involved in the deploy itself. The build
  command (`package.json`'s `build` script) runs `prisma migrate deploy`
  before `next build`, so schema changes apply automatically as part of each
  deploy. CI and CD are intentionally separate concerns: CI is a quality
  signal on GitHub, CD is Vercel's own git integration, not the other way
  around.

## Scope cuts

- **No edit, no pagination.** The task asked for create + view done well
  over several half-built features; delete was added afterward but editing
  and pagination don't add much at seed-data scale. Both are reasonable
  "next steps."
- **Single demo user, no signup flow.** Login only — there's no self-serve
  registration UI. New users are seeded directly. "Forgot password" is
  honest about this: it points to "contact your admin" rather than faking an
  email-reset flow that would need a transactional email provider.
- **No branch protection / required status checks.** CI runs and reports
  status on every push, but `main` isn't locked behind it — this is a
  solo-dev repo with direct pushes to `main`, so gating merges didn't fit
  the actual workflow.

## Deploying

Already deployed and connected for continuous deployment. To do it from
scratch on a fork:

1. Push to GitHub.
2. `vercel link` the project, then connect a Postgres database (Vercel
   dashboard → Storage → Connect Database → Neon is the easiest path — it
   auto-injects `DATABASE_URL` and friends).
3. Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL` (the deployed domain) as
   Production env vars.
4. `vercel --prod`, or just push to `main` — the git integration deploys
   automatically from there on.
