import { redirect } from "next/navigation";
import { PlusCircle, Rocket, Sparkles, Trash2 } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppSidebar } from "@/components/app-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const badgeStyles: Record<string, string> = {
  MAJOR: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  MINOR: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  PATCH: "bg-muted text-muted-foreground",
};

export default async function ProfilePage() {
  const session = await auth();

  // Proxy already gates this route, but the page needs the user's id/email
  // regardless, so it re-checks here too, same as every other data-fetching
  // page in the app.
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, majorCount, minorCount, patchCount, recentActivity] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: session.user.id } }),
      prisma.deployEntry.count({
        where: { authorId: session.user.id, severity: "MAJOR" },
      }),
      prisma.deployEntry.count({
        where: { authorId: session.user.id, severity: "MINOR" },
      }),
      prisma.deployEntry.count({
        where: { authorId: session.user.id, severity: "PATCH" },
      }),
      prisma.activityLog.findMany({
        where: { actorEmail: session.user.email! },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const totalCount = majorCount + minorCount + patchCount;
  const displayName = user?.name ?? user?.email ?? "Signed in";
  const initial = displayName.trim().charAt(0).toUpperCase();

  const stats = [
    { label: "Total deploys", value: totalCount, icon: Rocket },
    { label: "Major releases", value: majorCount, icon: Sparkles },
  ];

  return (
    <div className="flex h-dvh w-full">
      <AppSidebar
        current="profile"
        user={{ name: session.user.name, email: session.user.email }}
      />

      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-6xl flex-col p-6 md:p-10">
          <div>
            <h1 className="font-heading text-[22px] font-semibold">
              Profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Your account and deploy activity.
            </p>
          </div>

          <Card className="mt-8">
            <CardContent className="flex items-center gap-4 py-6">
              <Avatar className="size-16">
                <AvatarFallback className="bg-secondary text-xl font-medium text-secondary-foreground">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-heading text-lg font-semibold">
                  {displayName}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {user?.email}
                </p>
                {user?.createdAt && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Member since{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 grid grid-cols-2 gap-4">
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

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="font-heading text-base">
                Your recent activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No activity yet — log or delete a deploy entry to see it
                  here.
                </p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {recentActivity.map((event) => (
                    <li key={event.id} className="flex items-start gap-2.5">
                      {event.action === "CREATED" ? (
                        <PlusCircle className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Trash2 className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">
                            {event.action === "CREATED" ? "Created" : "Deleted"}{" "}
                            &ldquo;{event.entryTitle}&rdquo;
                          </span>
                          <Badge className={cn(badgeStyles[event.severity])}>
                            {event.severity.toLowerCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
