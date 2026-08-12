import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createDeployEntrySchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/deploy-entries/[id]">
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const existing = await prisma.deployEntry.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createDeployEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const updated = await prisma.deployEntry.update({
    where: { id },
    data: parsed.data,
  });

  await prisma.activityLog.create({
    data: {
      action: "UPDATED",
      entryTitle: updated.title,
      severity: updated.severity,
      actorName: session.user.name,
      actorEmail: session.user.email!,
    },
  });

  return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/deploy-entries/[id]">
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const entry = await prisma.deployEntry.findUnique({ where: { id } });
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.deployEntry.delete({ where: { id } });

  await prisma.activityLog.create({
    data: {
      action: "DELETED",
      entryTitle: entry.title,
      severity: entry.severity,
      actorName: session.user.name,
      actorEmail: session.user.email!,
    },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
