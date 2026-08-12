"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const severityOptions = [
  { value: "ALL", label: "All severities" },
  { value: "MAJOR", label: "Major" },
  { value: "MINOR", label: "Minor" },
  { value: "PATCH", label: "Patch" },
];

const sortOptions = [
  { value: "newest", label: "Recently added" },
  { value: "oldest", label: "Oldest first" },
];

const severityLabels = Object.fromEntries(
  severityOptions.map((option) => [option.value, option.label])
);
const sortLabels = Object.fromEntries(
  sortOptions.map((option) => [option.value, option.label])
);

export function DeployLogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const severity = searchParams.get("severity") ?? "ALL";
  const sort = searchParams.get("sort") ?? "newest";
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function updateParam(
    key: "severity" | "sort" | "q",
    value: string | null,
    defaultValue: string
  ) {
    if (value === null) return;
    const params = new URLSearchParams(searchParams.toString());
    if (value === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const paramsQuery = params.toString();
    router.push(paramsQuery ? `${pathname}?${paramsQuery}` : pathname);
  }

  // Debounce the search box so we're not pushing a URL update on every
  // keystroke — the rest of the filters update immediately since they're
  // discrete selections, not free text.
  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (query === current) return;

    const timeout = setTimeout(() => {
      updateParam("q", query, "");
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 pb-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search deploys..."
          className="h-7 w-[180px] pl-8 text-sm"
        />
      </div>

      <Select
        value={severity}
        onValueChange={(value) => updateParam("severity", value, "ALL")}
      >
        <SelectTrigger size="sm" className="w-[150px]">
          <SelectValue>
            {(value: string) => severityLabels[value] ?? value}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {severityOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sort}
        onValueChange={(value) => updateParam("sort", value, "newest")}
      >
        <SelectTrigger size="sm" className="w-[150px]">
          <SelectValue>{(value: string) => sortLabels[value] ?? value}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
