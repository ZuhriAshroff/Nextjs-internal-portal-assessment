import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
