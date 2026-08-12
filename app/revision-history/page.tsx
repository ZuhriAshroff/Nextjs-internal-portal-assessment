import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppSidebar } from "@/components/app-sidebar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const badgeStyles: Record<string, string> = {
  MAJOR: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  MINOR: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  PATCH: "bg-muted text-muted-foreground",
};

const actionMeta: Record<
  string,
  { label: string; icon: typeof PlusCircle; colorClass: string }
> = {
  CREATED: {
    label: "Created",
    icon: PlusCircle,
    colorClass: "text-emerald-600 dark:text-emerald-400",
  },
  UPDATED: {
    label: "Updated",
    icon: Pencil,
    colorClass: "text-amber-600 dark:text-amber-400",
  },
  DELETED: {
    label: "Deleted",
    icon: Trash2,
    colorClass: "text-red-600 dark:text-red-400",
  },
};

export default async function RevisionHistoryPage() {
  const session = await auth();

  const events = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex h-dvh w-full">
      <AppSidebar
        current="revision-history"
        user={{ name: session?.user?.name, email: session?.user?.email }}
      />

      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-6xl flex-col p-6 md:p-10">
          <div>
            <h1 className="font-heading text-[22px] font-semibold">
              Revision History
            </h1>
            <p className="text-sm text-muted-foreground">
              An audit trail of every deploy entry created or deleted,
              records persist here even after the entry itself is gone.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Action</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead className="w-[100px]">Severity</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead className="text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No activity yet. Create or delete a deploy entry to see
                      it here.
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => {
                    const meta = actionMeta[event.action];
                    return (
                    <TableRow key={event.id}>
                      <TableCell>
                        <span
                          className={cn(
                            "flex items-center gap-1.5 text-xs font-medium",
                            meta.colorClass
                          )}
                        >
                          <meta.icon className="size-3.5" />
                          {meta.label}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {event.entryTitle}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(badgeStyles[event.severity])}>
                          {event.severity.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {event.actorName ?? event.actorEmail}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(event.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
