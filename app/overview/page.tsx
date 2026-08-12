import { GitCommitHorizontal, Rocket, Users2, Zap } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";

const severityBarColor: Record<string, string> = {
  MAJOR: "bg-red-500",
  MINOR: "bg-amber-500",
  PATCH: "bg-zinc-400 dark:bg-zinc-500",
};

export default async function OverviewPage() {
  const session = await auth();

  // Server Component computing a per-request cutoff — not subject to
  // React's client-render purity/memoization concerns.
  // eslint-disable-next-line react-hooks/purity
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [total, majorCount, minorCount, patchCount, teamCount, recentCount] =
    await Promise.all([
      prisma.deployEntry.count(),
      prisma.deployEntry.count({ where: { severity: "MAJOR" } }),
      prisma.deployEntry.count({ where: { severity: "MINOR" } }),
      prisma.deployEntry.count({ where: { severity: "PATCH" } }),
      prisma.user.count(),
      prisma.deployEntry.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    ]);

  const breakdown = [
    { label: "Major", count: majorCount, color: severityBarColor.MAJOR },
    { label: "Minor", count: minorCount, color: severityBarColor.MINOR },
    { label: "Patch", count: patchCount, color: severityBarColor.PATCH },
  ];

  const stats = [
    { label: "Total deploys", value: total, icon: Rocket },
    { label: "Last 7 days", value: recentCount, icon: Zap },
    { label: "Team members", value: teamCount, icon: Users2 },
    { label: "Major releases", value: majorCount, icon: GitCommitHorizontal },
  ];

  return (
    <div className="flex h-dvh w-full">
      <AppSidebar
        current="overview"
        user={{ name: session?.user?.name, email: session?.user?.email }}
      />

      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-6xl flex-col p-6 md:p-10">
          <div>
            <h1 className="font-heading text-[22px] font-semibold">
              Overview
            </h1>
            <p className="text-sm text-muted-foreground">
              A snapshot of the team&rsquo;s release activity.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="flex items-center gap-3 py-5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                    <stat.icon className="size-4 text-muted-foreground" />
                  </span>
                  <div>
                    <p className="font-heading text-xl font-semibold">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="font-heading text-base">
                Severity breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {breakdown.map((item) => (
                <Progress
                  key={item.label}
                  value={total === 0 ? 0 : (item.count / total) * 100}
                  indicatorClassName={item.color}
                  className="flex-col items-stretch gap-1.5"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">
                      {item.count}
                    </span>
                  </div>
                </Progress>
              ))}
              {total === 0 && (
                <p className="text-sm text-muted-foreground">
                  No deploys logged yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
