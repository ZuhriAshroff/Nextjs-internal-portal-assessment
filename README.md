# Internal Portal

A small internal portal: login-gated, with a **Deploy Log** as the core
section (create/filter/search/sort/delete deploy entries), plus
**Revision History** (audit trail), **Overview** (stats), and **Team**.

**Live**: https://internal-portal-one-livid.vercel.app
**Demo login**: `demo@example.com` / `password123` (also shown on the login
page itself — it's a trial product, not a real account)

## Setup

```bash
npm install
cp .env.example .env          # fill in DATABASE_URL and NEXTAUTH_SECRET
npx prisma migrate dev        # applies the schema to your Postgres database
npm run db:seed               # demo user + a few sample entries
npm run dev
```

`DATABASE_URL` needs a real Postgres connection string — the free path is
[neon.tech](https://neon.tech), or Vercel's Storage tab → Connect Database →
Neon, which provisions one and wires up env vars for you.

```bash
openssl rand -base64 32   # for NEXTAUTH_SECRET
```

## Key decisions

- **NextAuth (Credentials) + Prisma/Postgres (Neon).** No OAuth setup needed
  for a demo login. Neon over something like AWS RDS because it's built for
  serverless — connection pooling is built in, which matters since every
  function invocation can otherwise exhaust a traditional Postgres
  instance's connection limit.
- **Two layers of auth, not one.** `proxy.ts` does a fast optimistic
  redirect for logged-out users; every API route independently calls
  `auth()` and returns `401` regardless, since proxy checks aren't a real
  security boundary. (One real bug here: `getToken()` defaults
  `secureCookie` to `false`, but NextAuth sets the `__Secure-`-prefixed
  cookie over HTTPS — without deriving it from `NODE_ENV`, the proxy
  silently treated logged-in users as logged out in production. Only
  surfaced by testing the live deploy, not locally over HTTP.)
- **Server component + Prisma for reads, client component + `fetch` for
  writes.** No API round-trip needed just to render a list from the same
  process; `router.refresh()` after a write keeps them in sync without a
  separate client cache.
- **Revision History is a real audit trail**, not the same data reshaped —
  a separate `ActivityLog` table with a denormalized snapshot (not a
  foreign key), so it survives the entry it describes being deleted.
- **Any authenticated user can delete any entry.** Treated as shared team
  state, not per-user data — a deliberate simplicity choice.

## Testing & CI/CD

```bash
npm run test   # Vitest — validation schema + deploy-log filter/sort logic
```

- **CI** (GitHub Actions, `.github/workflows/ci.yml`): lint, typecheck,
  tests, and a build on every push/PR. No branch protection — solo repo,
  direct pushes to `main`.
- **CD** (Vercel): the repo is connected directly, so every push to `main`
  auto-deploys. `prisma migrate deploy` runs as part of the build script, so
  schema changes apply automatically too. Kept separate from CI on purpose.

## Scope cuts

- No edit or pagination — create/view/delete done well beats several
  half-built features.
- Single demo user, no signup. "Forgot password" is honest about that too —
  it's a demo credentials note, not a fake email-reset flow.

## Deploying (from a fork)

1. Push to GitHub, `vercel link`.
2. Connect a Postgres database (Vercel → Storage → Connect Database → Neon).
3. Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL` as Production env vars.
4. Push to `main` — it deploys automatically from there.
