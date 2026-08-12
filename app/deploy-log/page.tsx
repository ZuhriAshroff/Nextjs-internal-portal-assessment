import { prisma } from "@/lib/prisma";
import { DeployEntryForm } from "@/components/deploy-entry-form";
import { DeployEntryList } from "@/components/deploy-entry-list";
import { LogoutButton } from "@/components/logout-button";

// This page reads fresh data on every request (new entries should show up
// immediately after router.refresh()). Nothing here calls a dynamic API, so
// without this Next.js would prerender it once at build time and serve
// stale data.
export const dynamic = "force-dynamic";

export default async function DeployLogPage() {
  // Direct Prisma call from the server component — avoids an unnecessary
  // network hop to our own API route for the initial page render.
  const entries = await prisma.deployEntry.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Deploy Log</h1>
          <p className="text-sm text-muted-foreground">
            Team record of what shipped, and how big a deal it was.
          </p>
        </div>
        <LogoutButton />
      </div>

      <DeployEntryForm />
      <DeployEntryList entries={entries} />
    </div>
  );
}
