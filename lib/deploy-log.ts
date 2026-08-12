export const SEVERITIES = ["MAJOR", "MINOR", "PATCH"] as const;
export type Severity = (typeof SEVERITIES)[number];

/**
 * Entries are expected sorted newest-first, so the first MAJOR entry found
 * is the most recent one — everything ahead of it in the list shipped
 * since.
 */
export function getSinceLastMajorText(entries: { severity: string }[]) {
  if (entries.length === 0) return null;

  const majorIndex = entries.findIndex((entry) => entry.severity === "MAJOR");

  if (majorIndex === -1) {
    return `${entries.length} deploy${entries.length === 1 ? "" : "s"} logged — no major release yet`;
  }

  return `${majorIndex} deploy${majorIndex === 1 ? "" : "s"} since the last major release`;
}

type FilterableEntry = {
  severity: string;
  title: string;
  description: string;
};

export function filterAndSortEntries<T extends FilterableEntry>(
  entries: T[],
  options: {
    severityFilter?: Severity | null;
    query?: string;
    sortOldestFirst?: boolean;
  }
): T[] {
  const { severityFilter = null, query = "", sortOldestFirst = false } = options;

  let result = severityFilter
    ? entries.filter((entry) => entry.severity === severityFilter)
    : entries;

  const trimmedQuery = query.trim();
  if (trimmedQuery) {
    const q = trimmedQuery.toLowerCase();
    result = result.filter(
      (entry) =>
        entry.title.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q)
    );
  }

  if (sortOldestFirst) {
    result = [...result].reverse();
  }

  return result;
}

export function getEmptyMessage(options: {
  query?: string;
  severityFilter?: Severity | null;
}) {
  const trimmedQuery = options.query?.trim();
  if (trimmedQuery) return `No deploys match "${trimmedQuery}".`;
  if (options.severityFilter) {
    return `No ${options.severityFilter.toLowerCase()} deploys yet.`;
  }
  return undefined;
}
