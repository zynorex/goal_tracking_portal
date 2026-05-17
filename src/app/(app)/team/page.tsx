import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  if (session.user.role === "EMPLOYEE") {
    return <div>Unauthorized</div>;
  }

  // Get direct reports
  const directReports = await prisma.user.findMany({
    where: { managerId: session.user.id },
    include: {
      goalSheets: {
        where: { year: 2024 }
      }
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED": return <Badge className="bg-[#2ECC71]">Approved</Badge>;
      case "SUBMITTED": return <Badge className="bg-[#F39C12]">Pending Review</Badge>;
      case "RETURNED": return <Badge className="bg-[#E74C3C]">Returned</Badge>;
      default: return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1E3A5F]">Team Goals</h1>
        <p className="text-muted-foreground mt-1">Review and approve goal sheets for your direct reports.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Direct Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Goal Sheet Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {directReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No direct reports found.
                    </TableCell>
                  </TableRow>
                ) : (
                  directReports.map((report) => {
                    const sheet = report.goalSheets[0];
                    const status = sheet?.status || "NOT_STARTED";
                    
                    return (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell>{report.department}</TableCell>
                        <TableCell>
                          {status === "NOT_STARTED" ? (
                            <Badge variant="secondary">Not Started</Badge>
                          ) : (
                            getStatusBadge(status)
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {status === "NOT_STARTED" || !sheet?.id ? (
                            <Button variant="outline" size="sm" disabled>View</Button>
                          ) : (
                            <Link href={`/goals/${sheet.id}`}>
                              <Button 
                                variant={status === "SUBMITTED" ? "default" : "outline"} 
                                size="sm"
                                className={status === "SUBMITTED" ? "bg-[#2E86AB] hover:bg-[#1E3A5F]" : ""}
                              >
                                {status === "SUBMITTED" ? "Review" : "View"}
                              </Button>
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
