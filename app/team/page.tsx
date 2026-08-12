import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppSidebar } from "@/components/app-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const session = await auth();

  const members = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { deployEntries: true } } },
  });

  return (
    <div className="flex h-dvh w-full">
      <AppSidebar
        current="team"
        user={{ name: session?.user?.name, email: session?.user?.email }}
      />

      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-6xl flex-col p-6 md:p-10">
          <div>
            <h1 className="font-heading text-[22px] font-semibold">Team</h1>
            <p className="text-sm text-muted-foreground">
              Everyone with access to the portal.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => {
              const displayName = member.name ?? member.email;
              const initial = displayName.trim().charAt(0).toUpperCase();

              return (
                <Card key={member.id}>
                  <CardContent className="flex items-center gap-3 py-5">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {displayName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                    <Badge className="bg-muted text-muted-foreground">
                      {member._count.deployEntries} deploy
                      {member._count.deployEntries === 1 ? "" : "s"}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
