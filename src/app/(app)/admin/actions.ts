"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function updateSystemWindows(windowsData: Record<string, { active: boolean }>) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const updatedConfig = await prisma.systemConfig.upsert({
    where: { key: 'cycle_windows' },
    update: { value: JSON.stringify(windowsData) },
    create: { key: 'cycle_windows', value: JSON.stringify(windowsData) }
  });

  revalidatePath("/admin");

  return updatedConfig;
}

export async function getExportData() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const users = await prisma.user.findMany({
    include: {
      goalSheets: {
        include: {
          goals: true
        }
      }
    }
  });

  return users;
}
