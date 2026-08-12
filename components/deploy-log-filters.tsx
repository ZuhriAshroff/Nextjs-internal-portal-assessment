"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

  function updateParam(
    key: "severity" | "sort",
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
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex shrink-0 items-center gap-2 pb-4">
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
