import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createDeployEntrySchema } from "@/lib/validations";

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
