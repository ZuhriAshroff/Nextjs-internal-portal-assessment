import { Rocket, Sparkles, Zap } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppSidebar } from "@/components/app-sidebar";
import { DeployEntryForm } from "@/components/deploy-entry-form";
import { DeployEntryList } from "@/components/deploy-entry-list";
import { DeployLogFilters } from "@/components/deploy-log-filters";
import { Card, CardContent } from "@/components/ui/card";

// This page reads fresh data on every request (new entries should show up
// immediately after router.refresh()). Nothing here calls a dynamic API, so
// without this Next.js would prerender it once at build time and serve
// stale data.
export const dynamic = "force-dynamic";

const SEVERITIES = ["MAJOR", "MINOR", "PATCH"] as const;
type Severity = (typeof SEVERITIES)[number];

function getSinceLastMajorText(entries: { severity: string }[]) {
  if (entries.length === 0) return null;

  // Entries are sorted newest-first, so the first MAJOR entry found is the
  // most recent one — everything ahead of it in the list shipped since.
  const majorIndex = entries.findIndex((entry) => entry.severity === "MAJOR");

  if (majorIndex === -1) {
    return `${entries.length} deploy${entries.length === 1 ? "" : "s"} logged — no major release yet`;
  }

  return `${majorIndex} deploy${majorIndex === 1 ? "" : "s"} since the last major release`;
}

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

  let displayedEntries = severityFilter
    ? allEntries.filter((entry) => entry.severity === severityFilter)
    : allEntries;

  if (query) {
    const q = query.toLowerCase();
    displayedEntries = displayedEntries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q)
    );
  }

  if (sortOldestFirst) {
    displayedEntries = [...displayedEntries].reverse();
  }

  const emptyMessage = query
    ? `No deploys match "${query}".`
    : severityFilter
      ? `No ${severityFilter.toLowerCase()} deploys yet.`
      : undefined;

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
                <DeployEntryList
                  entries={displayedEntries}
                  emptyMessage={emptyMessage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
