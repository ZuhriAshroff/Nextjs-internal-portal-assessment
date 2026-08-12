import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const severityStyles: Record<Severity, string> = {
  MAJOR: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  MINOR: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  PATCH: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

export function DeployEntryList({ entries }: { entries: DeployEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No deploy entries yet. Log the first one above.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => (
        <Card key={entry.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <CardTitle className="text-base">{entry.title}</CardTitle>
            <Badge className={cn(severityStyles[entry.severity])}>
              {entry.severity.toLowerCase()}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{entry.description}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {entry.author.name ?? entry.author.email} ·{" "}
              {new Date(entry.createdAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
