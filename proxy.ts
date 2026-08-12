import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Next.js 16 renamed the Middleware convention to Proxy — same runtime
// behavior, this just needs to live in `proxy.ts` instead of `middleware.ts`.
//
// This is an optimistic check only (fast JWT decode, no DB hit): it keeps
// unauthenticated users off the page, but every API route still
// re-validates the session server-side before touching data. See
// app/api/deploy-entries/route.ts and the README for why.
export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    // getToken defaults secureCookie to false, but NextAuth sets the
    // __Secure-prefixed cookie whenever the app is served over HTTPS (e.g.
    // in production on Vercel). Without this, the proxy looks for the wrong
    // cookie name and treats logged-in users as unauthenticated.
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/deploy-log/:path*",
    "/revision-history/:path*",
    "/overview/:path*",
    "/team/:path*",
    "/profile/:path*",
  ],
};
