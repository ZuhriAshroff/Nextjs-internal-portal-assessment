import { Rocket, Sparkles, Zap } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  SEVERITIES,
  type Severity,
  filterAndSortEntries,
  getEmptyMessage,
  getSinceLastMajorText,
} from "@/lib/deploy-log";
import { AppSidebar } from "@/components/app-sidebar";
import { DeployEntryForm } from "@/components/deploy-entry-form";
import { DeployEntryList } from "@/components/deploy-entry-list";
import { DeployEntryTable } from "@/components/deploy-entry-table";
import { DeployLogFilters } from "@/components/deploy-log-filters";
import { Card, CardContent } from "@/components/ui/card";

// This page reads fresh data on every request (new entries should show up
// immediately after router.refresh()). Nothing here calls a dynamic API, so
// without this Next.js would prerender it once at build time and serve
// stale data.
export const dynamic = "force-dynamic";

export default async function DeployLogPage(props: PageProps<"/deploy-log">) {
  const searchParams = await props.searchParams;
  const session = await auth();

  const severityParam = searchParams.severity;
  const severityFilter = SEVERITIES.includes(severityParam as Severity)
    ? (severityParam as Severity)
    : null;

  const sortParam = searchParams.sort;
  const sortOldestFirst = sortParam === "oldest";

  const queryParam = searchParams.q;
  const query = typeof queryParam === "string" ? queryParam.trim() : "";

  const view = searchParams.view === "table" ? "table" : "timeline";

  // Fetch once, newest-first — the stats and the "since last major" counter
  // always read the full, unfiltered timeline, while severity/search
  // filtering and sort order are applied in memory to derive what's shown.
  const allEntries = await prisma.deployEntry.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  });

  const sinceLastMajorText = getSinceLastMajorText(allEntries);

  // Server Component computing a per-request cutoff — not subject to
  // React's client-render purity/memoization concerns.
  // eslint-disable-next-line react-hooks/purity
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const stats = [
    { label: "Total deploys", value: allEntries.length, icon: Rocket },
    {
      label: "Last 7 days",
      value: allEntries.filter((e) => e.createdAt >= sevenDaysAgo).length,
      icon: Zap,
    },
    {
      label: "Major releases",
      value: allEntries.filter((e) => e.severity === "MAJOR").length,
      icon: Sparkles,
    },
  ];

  const displayedEntries = filterAndSortEntries(allEntries, {
    severityFilter,
    query,
    sortOldestFirst,
  });

  const emptyMessage = getEmptyMessage({ query, severityFilter });

  return (
    <div className="flex h-dvh w-full">
      <AppSidebar
        current="deploy-log"
        user={{ name: session?.user?.name, email: session?.user?.email }}
      />

      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="mx-auto flex h-full max-w-6xl flex-col p-6 md:p-10">
          <div className="shrink-0">
            <h1 className="font-heading text-[22px] font-semibold">
              Deploy Log
            </h1>
            <p className="text-sm text-muted-foreground">
              Team record of what shipped, and how big a deal it was.
            </p>
            {sinceLastMajorText && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>{sinceLastMajorText}</span>
              </div>
            )}
          </div>

          <div className="mt-6 grid shrink-0 grid-cols-3 gap-3">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="flex items-center gap-2.5 py-3.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                    <stat.icon className="size-3.5 text-muted-foreground" />
                  </span>
                  <div>
                    <p className="font-heading text-base leading-none font-semibold">
                      {stat.value}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 grid min-h-0 flex-1 grid-cols-1 gap-10 md:grid-cols-[360px_1fr]">
            <div className="md:overflow-y-auto">
              <DeployEntryForm />
            </div>

            <div className="flex min-h-0 flex-col md:overflow-hidden">
              <DeployLogFilters />
              <div className="min-h-0 flex-1 md:overflow-y-auto md:pr-2">
                {view === "table" ? (
                  <DeployEntryTable
                    entries={displayedEntries}
                    emptyMessage={emptyMessage}
                  />
                ) : (
                  <DeployEntryList
                    entries={displayedEntries}
                    emptyMessage={emptyMessage}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
