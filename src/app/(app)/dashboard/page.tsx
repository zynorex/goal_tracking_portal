import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GoalDistributionChart, PerformanceTrendsChart } from "./DashboardCharts";
import { Activity, Target, CheckCircle2, Clock } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const role = session.user.role;

  let totalGoals = 0;
  let approvedGoals = 0;
  let overallProgress = 0;

  if (role === "EMPLOYEE") {
    const sheets = await prisma.goalSheet.findMany({
      where: { userId: session.user.id }
    });
    const sheetId = sheets[0]?.id;
    if (sheetId) {
      const goals = await prisma.goal.findMany({ where: { goalSheetId: sheetId } });
      totalGoals = goals.length;
      approvedGoals = sheets[0].status === "APPROVED" ? totalGoals : 0;
      
      // Mock progress calculation
      if (totalGoals > 0) {
        overallProgress = Math.round(Math.random() * 40 + 40); // 40-80% random progress for demo
      }
    }
  }

  // Mock Recent Activity
  const recentActivities = [
    { id: 1, action: "Goal Sheet Submitted", time: "2 hours ago", desc: "You submitted your 2024 Goal Sheet for approval." },
    { id: 2, action: "Quarterly Check-in Opened", time: "1 day ago", desc: "Admin opened the Q1 check-in window." },
    { id: 3, action: "Goal Added", time: "3 days ago", desc: "You added 'Increase Revenue by 10%' to your sheet." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-[#1E3A5F]">
          Welcome back, {session.user.name}
        </h1>
        <p className="text-muted-foreground">
          Here is what&apos;s happening with your goals and performance today.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-[#2E86AB] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-[#2E86AB]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGoals || (role !== 'EMPLOYEE' ? 124 : 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active goals for FY24
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-[#2ECC71] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Goals</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-[#2ECC71]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedGoals || (role !== 'EMPLOYEE' ? 98 : 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Fully locked and approved
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#F39C12] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-[#F39C12]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{role !== 'EMPLOYEE' ? 26 : (totalGoals > approvedGoals ? 1 : 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting manager action
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#1E3A5F] shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <Activity className="h-4 w-4 text-[#1E3A5F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress || (role !== 'EMPLOYEE' ? 76 : 0)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average completion rate
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>
              Quarterly planned vs. achieved metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0 pr-4">
            <PerformanceTrendsChart />
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Goal Distribution</CardTitle>
            <CardDescription>
              Weightage distribution by Thrust Area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GoalDistributionChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentActivities.map((activity, i) => (
                <div key={activity.id} className="flex">
                  <div className="mt-0.5 relative">
                    <div className="h-2 w-2 rounded-full bg-[#2E86AB] ring-4 ring-white" />
                    {i !== recentActivities.length - 1 && (
                      <div className="absolute top-2 left-[3px] -ml-[0.5px] h-full w-[1px] bg-slate-200" />
                    )}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.desc}</p>
                    <p className="text-xs text-slate-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
