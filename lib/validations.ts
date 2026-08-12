import { z } from "zod";

export const createDeployEntrySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().min(1, "Description is required").max(2000),
  severity: z.enum(["MAJOR", "MINOR", "PATCH"]),
});
