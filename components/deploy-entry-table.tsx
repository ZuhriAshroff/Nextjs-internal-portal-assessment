import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export function DeployEntryTable({
  entries,
  emptyMessage,
}: {
  entries: DeployEntry[];
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/60">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="w-[100px]">Severity</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Author</TableHead>
            <TableHead className="text-right">Date</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-10 text-center text-sm text-muted-foreground"
              >
                {emptyMessage ?? "No deploy entries yet."}
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">{entry.title}</TableCell>
                <TableCell>
                  <Badge className={cn(badgeStyles[entry.severity])}>
                    {entry.severity.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {entry.description}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.author.name ?? entry.author.email}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-0.5">
                    <EditEntryDialog
                      id={entry.id}
                      title={entry.title}
                      description={entry.description}
                      severity={entry.severity}
                    />
                    <DeleteEntryButton id={entry.id} title={entry.title} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
