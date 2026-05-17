import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoalSheetView } from "../GoalSheetView";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function GoalSheetReviewPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const sheet = await prisma.goalSheet.findUnique({
    where: { id: params.id },
    include: { 
      goals: true,
      user: true
    }
  });

  if (!sheet) redirect("/team");

  // Ensure only the manager or the employee can view it
  if (sheet.userId !== session.user.id && session.user.role === "EMPLOYEE") {
    redirect("/dashboard");
  }

  // Determine if it's a manager viewing their report's sheet
  const isManagerView = session.user.role === "MANAGER" || session.user.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1E3A5F]">
            {isManagerView ? `${sheet.user.name}'s Goals` : "My Goals"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isManagerView ? "Review and approve goal sheets for your direct reports." : "Manage and track your goals for the current year."}
          </p>
        </div>
      </div>
      
      <GoalSheetView initialSheet={sheet} isManagerView={isManagerView && sheet.userId !== session.user.id} />
    </div>
  );
}
