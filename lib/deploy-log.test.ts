import { describe, expect, it } from "vitest";
import {
  filterAndSortEntries,
  getEmptyMessage,
  getSinceLastMajorText,
} from "./deploy-log";

describe("getSinceLastMajorText", () => {
  it("returns null for an empty list", () => {
    expect(getSinceLastMajorText([])).toBeNull();
  });

  it("counts deploys ahead of the most recent MAJOR entry", () => {
    const entries = [
      { severity: "MINOR" },
      { severity: "PATCH" },
      { severity: "MAJOR" },
      { severity: "MINOR" },
    ];
    expect(getSinceLastMajorText(entries)).toBe(
      "2 deploys since the last major release"
    );
  });

  it("uses singular phrasing for exactly one deploy since", () => {
    const entries = [{ severity: "MINOR" }, { severity: "MAJOR" }];
    expect(getSinceLastMajorText(entries)).toBe(
      "1 deploy since the last major release"
    );
  });

  it("returns zero when the newest entry is itself MAJOR", () => {
    const entries = [{ severity: "MAJOR" }, { severity: "MINOR" }];
    expect(getSinceLastMajorText(entries)).toBe(
      "0 deploys since the last major release"
    );
  });

  it("falls back to a total count when there's no MAJOR entry yet", () => {
    const entries = [{ severity: "MINOR" }, { severity: "PATCH" }];
    expect(getSinceLastMajorText(entries)).toBe(
      "2 deploys logged — no major release yet"
    );
  });
});

describe("filterAndSortEntries", () => {
  const entries = [
    { severity: "MAJOR", title: "Checkout API v2 released", description: "Rolled out to all traffic" },
    { severity: "MINOR", title: "Fix flaky retry logic", description: "Backoff was multiplying incorrectly" },
    { severity: "PATCH", title: "Bump dependency versions", description: "Routine update" },
  ];

  it("returns entries unchanged with no options", () => {
    expect(filterAndSortEntries(entries, {})).toEqual(entries);
  });

  it("filters by severity", () => {
    const result = filterAndSortEntries(entries, { severityFilter: "MINOR" });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Fix flaky retry logic");
  });

  it("filters by a case-insensitive title/description match", () => {
    const result = filterAndSortEntries(entries, { query: "BACKOFF" });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Fix flaky retry logic");
  });

  it("combines severity and query filters", () => {
    const result = filterAndSortEntries(entries, {
      severityFilter: "PATCH",
      query: "dependency",
    });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Bump dependency versions");
  });

  it("returns nothing when the query matches no entry", () => {
    expect(filterAndSortEntries(entries, { query: "nonexistent" })).toEqual([]);
  });

  it("reverses order when sortOldestFirst is set", () => {
    const result = filterAndSortEntries(entries, { sortOldestFirst: true });
    expect(result.map((e) => e.title)).toEqual([
      "Bump dependency versions",
      "Fix flaky retry logic",
      "Checkout API v2 released",
    ]);
  });

  it("does not mutate the input array", () => {
    const original = [...entries];
    filterAndSortEntries(entries, { sortOldestFirst: true });
    expect(entries).toEqual(original);
  });
});

describe("getEmptyMessage", () => {
  it("returns undefined with no filters", () => {
    expect(getEmptyMessage({})).toBeUndefined();
  });

  it("prioritizes the search message over the severity message", () => {
    expect(
      getEmptyMessage({ query: "xyz", severityFilter: "MAJOR" })
    ).toBe('No deploys match "xyz".');
  });

  it("falls back to a severity-specific message", () => {
    expect(getEmptyMessage({ severityFilter: "PATCH" })).toBe(
      "No patch deploys yet."
    );
  });
});
