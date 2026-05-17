"use server";

import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function addGoal(data: {
  goalSheetId: string;
  title: string;
  thrustArea: string;
  uomType: string;
  target: string;
  weightage: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  // Validate the sheet belongs to the user and is not locked
  const sheet = await prisma.goalSheet.findUnique({
    where: { id: data.goalSheetId },
    include: { goals: true }
  });

  if (!sheet || sheet.userId !== session.user.id) {
    throw new Error("Invalid sheet");
  }

  if (sheet.status === "APPROVED" || sheet.status === "SUBMITTED") {
    throw new Error("Sheet is locked");
  }

  const currentTotalWeightage = sheet.goals.reduce((acc, g) => acc + g.weightage, 0);
  if (currentTotalWeightage + data.weightage > 100) {
    throw new Error(`Total weightage cannot exceed 100%. Current: ${currentTotalWeightage}%`);
  }
  
  if (sheet.goals.length >= 8) {
    throw new Error("Maximum of 8 goals allowed");
  }

  const newGoal = await prisma.goal.create({
    data: {
      goalSheetId: data.goalSheetId,
      title: data.title,
      thrustArea: data.thrustArea,
      uomType: data.uomType,
      target: data.target,
      weightage: data.weightage,
    }
  });

  return newGoal;
}

export async function submitGoalSheet(sheetId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const sheet = await prisma.goalSheet.findUnique({
    where: { id: sheetId },
    include: { goals: true }
  });

  if (!sheet || sheet.userId !== session.user.id) throw new Error("Invalid sheet");

  const totalWeightage = sheet.goals.reduce((acc, g) => acc + g.weightage, 0);
  if (totalWeightage !== 100) {
    throw new Error("Total weightage must be exactly 100%");
  }

  const updated = await prisma.goalSheet.update({
    where: { id: sheetId },
    data: { status: "SUBMITTED" }
  });

  return updated;
}

export async function reviewGoalSheet(sheetId: string, action: "APPROVE" | "RETURN") {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role === "EMPLOYEE") throw new Error("Unauthorized");

  const sheet = await prisma.goalSheet.findUnique({
    where: { id: sheetId },
    include: { user: true }
  });

  if (!sheet) throw new Error("Invalid sheet");
  
  // Basic check: manager must own the user or be admin
  if (sheet.user.managerId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Not authorized to review this sheet");
  }

  const newStatus = action === "APPROVE" ? "APPROVED" : "RETURNED";

  const updated = await prisma.goalSheet.update({
    where: { id: sheetId },
    data: { status: newStatus }
  });

  return updated;
}
