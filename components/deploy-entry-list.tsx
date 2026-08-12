import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DeleteEntryButton } from "@/components/delete-entry-button";
import { EditEntryDialog } from "@/components/edit-entry-dialog";
import { cn } from "@/lib/utils";

type Severity = "MAJOR" | "MINOR" | "PATCH";

type DeployEntry = {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  createdAt: Date;
  author: { name: string | null; email: string };
};

const badgeStyles: Record<Severity, string> = {
  MAJOR: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  MINOR: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  PATCH: "bg-muted text-muted-foreground",
};

const dotStyles: Record<Severity, string> = {
  MAJOR: "bg-red-500",
  MINOR: "bg-amber-500",
  PATCH: "bg-zinc-400 dark:bg-zinc-500",
};

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function DeployEntryList({
  entries,
  emptyMessage,
}: {
  entries: DeployEntry[];
  emptyMessage?: string;
}) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {emptyMessage ?? "No deploy entries yet. Log the first one to the left."}
      </p>
    );
  }

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-[5px] w-px bg-border"
      />
      <ol className="flex flex-col gap-8">
        {entries.map((entry) => (
          <li key={entry.id} className="relative pl-7">
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-1.5 left-0 z-10 block size-[11px] rounded-full ring-4 ring-background",
                dotStyles[entry.severity]
              )}
            />

            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h3 className="font-heading text-[15px] font-semibold">
                  {entry.title}
                </h3>
                <Badge className={cn(badgeStyles[entry.severity])}>
                  {entry.severity.toLowerCase()}
                </Badge>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <EditEntryDialog
                  id={entry.id}
                  title={entry.title}
                  description={entry.description}
                  severity={entry.severity}
                />
                <DeleteEntryButton id={entry.id} title={entry.title} />
              </div>
            </div>

            <p className="mt-1.5 text-sm text-muted-foreground">
              {entry.description}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground/70">
              <Avatar className="size-4">
                <AvatarFallback className="bg-secondary text-[9px] text-secondary-foreground">
                  {(entry.author.name ?? entry.author.email)
                    .trim()
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>
                {entry.author.name ?? entry.author.email} ·{" "}
                {formatDateTime(entry.createdAt)}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
