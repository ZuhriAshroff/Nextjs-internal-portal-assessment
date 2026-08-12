import { prisma } from "@/lib/prisma";
import { DeployEntryForm } from "@/components/deploy-entry-form";
import { DeployEntryList } from "@/components/deploy-entry-list";
import { DeployLogFilters } from "@/components/deploy-log-filters";
import { LogoutButton } from "@/components/logout-button";

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

  const severityParam = searchParams.severity;
  const severityFilter = SEVERITIES.includes(severityParam as Severity)
    ? (severityParam as Severity)
    : null;

  const sortParam = searchParams.sort;
  const sortOldestFirst = sortParam === "oldest";

  // Fetch once, newest-first — the "since last major" counter always reads
  // the full, unfiltered timeline (it describes the team's overall release
  // cadence), while severity filtering and sort order are applied in memory
  // to derive what's actually displayed.
  const allEntries = await prisma.deployEntry.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  });

  const sinceLastMajorText = getSinceLastMajorText(allEntries);

  let displayedEntries = severityFilter
    ? allEntries.filter((entry) => entry.severity === severityFilter)
    : allEntries;

  if (sortOldestFirst) {
    displayedEntries = [...displayedEntries].reverse();
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-5xl flex-col p-4 py-10">
      <div className="flex shrink-0 items-start justify-between">
        <div>
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
        <LogoutButton />
      </div>

      <div className="mt-6 grid min-h-0 flex-1 grid-cols-1 gap-8 md:grid-cols-[330px_1fr]">
        <div className="md:overflow-y-auto">
          <DeployEntryForm />
        </div>

        <div className="flex min-h-0 flex-col md:overflow-hidden">
          <DeployLogFilters />
          <div className="min-h-0 flex-1 md:overflow-y-auto md:pr-2">
            <DeployEntryList
              entries={displayedEntries}
              emptyMessage={
                severityFilter
                  ? `No ${severityFilter.toLowerCase()} deploys yet.`
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
