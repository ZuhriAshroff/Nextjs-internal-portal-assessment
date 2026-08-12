import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      passwordHash,
      name: "Demo User",
    },
  });

  await prisma.deployEntry.createMany({
    data: [
      {
        title: "Checkout API v2 released",
        description: "Rolled out the new checkout endpoint to all traffic.",
        severity: "MAJOR",
        authorId: user.id,
      },
      {
        title: "Fix flaky retry logic in payment worker",
        description: "Backoff was multiplying incorrectly on 429s.",
        severity: "MINOR",
        authorId: user.id,
      },
      {
        title: "Bump dependency versions",
        description: "Routine patch update, no behavior change.",
        severity: "PATCH",
        authorId: user.id,
      },
    ],
  });

  console.log("Seeded demo user: demo@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
