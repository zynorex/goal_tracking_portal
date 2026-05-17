import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { GoalSheetView } from "./GoalSheetView";

const prisma = new PrismaClient();

export default async function GoalsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  let sheet = await prisma.goalSheet.findFirst({
    where: { userId: session.user.id, year: 2024 },
    include: { goals: true }
  });

  if (!sheet) {
    sheet = await prisma.goalSheet.create({
      data: {
        userId: session.user.id,
        year: 2024,
      },
      include: { goals: true }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1E3A5F]">My Goals</h1>
          <p className="text-muted-foreground mt-1">Manage and track your goals for the current year.</p>
        </div>
      </div>
      
      <GoalSheetView initialSheet={sheet} />
    </div>
  );
}
