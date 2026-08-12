import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const createDeployEntrySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().min(1, "Description is required").max(2000),
  severity: z.enum(["MAJOR", "MINOR", "PATCH"]),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createDeployEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const entry = await prisma.deployEntry.create({
    data: {
      ...parsed.data,
      authorId: session.user.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "CREATED",
      entryTitle: entry.title,
      severity: entry.severity,
      actorName: session.user.name,
      actorEmail: session.user.email!,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
