import { describe, expect, it } from "vitest";
import { createDeployEntrySchema } from "./validations";

describe("createDeployEntrySchema", () => {
  it("accepts a valid entry", () => {
    const result = createDeployEntrySchema.safeParse({
      title: "Checkout API v2 released",
      description: "Rolled out the new checkout endpoint to all traffic.",
      severity: "MAJOR",
    });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from title and description", () => {
    const result = createDeployEntrySchema.safeParse({
      title: "  Fix flaky retry logic  ",
      description: "  Backoff was multiplying incorrectly.  ",
      severity: "MINOR",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Fix flaky retry logic");
      expect(result.data.description).toBe(
        "Backoff was multiplying incorrectly."
      );
    }
  });

  it("rejects an empty title", () => {
    const result = createDeployEntrySchema.safeParse({
      title: "",
      description: "Something changed.",
      severity: "PATCH",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a title that is only whitespace", () => {
    const result = createDeployEntrySchema.safeParse({
      title: "   ",
      description: "Something changed.",
      severity: "PATCH",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing description", () => {
    const result = createDeployEntrySchema.safeParse({
      title: "Bump dependency versions",
      severity: "PATCH",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid severity", () => {
    const result = createDeployEntrySchema.safeParse({
      title: "Bump dependency versions",
      description: "Routine update.",
      severity: "CRITICAL",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a title over 200 characters", () => {
    const result = createDeployEntrySchema.safeParse({
      title: "a".repeat(201),
      description: "Something changed.",
      severity: "PATCH",
    });
    expect(result.success).toBe(false);
  });
});
