"use server";

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function updateSystemWindows(windowsData: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const updatedConfig = await prisma.systemConfig.upsert({
    where: { key: 'cycle_windows' },
    update: { value: JSON.stringify(windowsData) },
    create: { key: 'cycle_windows', value: JSON.stringify(windowsData) }
  });

  return updatedConfig;
}
