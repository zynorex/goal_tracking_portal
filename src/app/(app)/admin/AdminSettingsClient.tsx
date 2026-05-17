"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateSystemWindows, getExportData } from "./actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

export function AdminSettingsClient({ initialWindows }: { initialWindows: Record<string, { active: boolean }> }) {
  const router = useRouter();
  const [windows, setWindows] = useState(initialWindows || {});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleToggle = async (key: string, checked: boolean) => {
    const newWindows = { ...windows, [key]: { active: checked } };
    setWindows(newWindows);
    
    setIsUpdating(true);
    try {
      await updateSystemWindows(newWindows);
      toast.success(`${key} window ${checked ? 'opened' : 'closed'} successfully.`);
    } catch (error) {
      toast.error((error as Error).message || "Failed to update configuration");
      // Revert on failure
      setWindows(windows);
    } finally {
      setIsUpdating(false);
      router.refresh();
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const usersData = await getExportData();
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const exportRows: any[] = [];
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      usersData.forEach((user: any) => {
        if (!user.goalSheets || user.goalSheets.length === 0) {
          exportRows.push({
            "Employee Name": user.name,
            "Email": user.email,
            "Department": user.department,
            "Role": user.role,
            "Goal Year": "N/A",
            "Sheet Status": "No Sheet",
            "Goal Title": "N/A",
            "Thrust Area": "N/A",
            "Target": "N/A",
            "Weightage (%)": "N/A",
            "UoM": "N/A"
          });
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user.goalSheets.forEach((sheet: any) => {
          if (!sheet.goals || sheet.goals.length === 0) {
            exportRows.push({
              "Employee Name": user.name,
              "Email": user.email,
              "Department": user.department,
              "Role": user.role,
              "Goal Year": sheet.year,
              "Sheet Status": sheet.status,
              "Goal Title": "No Goals",
              "Thrust Area": "N/A",
              "Target": "N/A",
              "Weightage (%)": "N/A",
              "UoM": "N/A"
            });
            return;
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sheet.goals.forEach((goal: any) => {
            exportRows.push({
              "Employee Name": user.name,
              "Email": user.email,
              "Department": user.department,
              "Role": user.role,
              "Goal Year": sheet.year,
              "Sheet Status": sheet.status,
              "Goal Title": goal.title,
              "Thrust Area": goal.thrustArea,
              "Target": goal.target,
              "Weightage (%)": goal.weightage,
              "UoM": goal.uomType
            });
          });
        });
      });

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "System Goals");
      
      XLSX.writeFile(workbook, "AtomQuest_Goals_Export.xlsx");
      toast.success("Export successful!");
    } catch (error) {
      toast.error("Failed to export data");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Cycle Windows</CardTitle>
          <CardDescription>Open or close performance windows for all employees.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label className="text-base">Goal Setting</Label>
              <div className="text-sm text-muted-foreground">Allow creation and submission of goal sheets.</div>
            </div>
            <Switch 
              checked={windows.goalSetting?.active || false} 
              onCheckedChange={(c) => handleToggle('goalSetting', c)}
              disabled={isUpdating}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label className="text-base">Q1 Check-in</Label>
              <div className="text-sm text-muted-foreground">Open Q1 actuals update window.</div>
            </div>
            <Switch 
              checked={windows.Q1?.active || false} 
              onCheckedChange={(c) => handleToggle('Q1', c)}
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label className="text-base">Q2 Check-in</Label>
              <div className="text-sm text-muted-foreground">Open Q2 actuals update window.</div>
            </div>
            <Switch 
              checked={windows.Q2?.active || false} 
              onCheckedChange={(c) => handleToggle('Q2', c)}
              disabled={isUpdating}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label className="text-base">Q3 Check-in</Label>
              <div className="text-sm text-muted-foreground">Open Q3 actuals update window.</div>
            </div>
            <Switch 
              checked={windows.Q3?.active || false} 
              onCheckedChange={(c) => handleToggle('Q3', c)}
              disabled={isUpdating}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label className="text-base">Q4 / Annual</Label>
              <div className="text-sm text-muted-foreground">Open Q4 final achievement capture window.</div>
            </div>
            <Switch 
              checked={windows.Q4?.active || false} 
              onCheckedChange={(c) => handleToggle('Q4', c)}
              disabled={isUpdating}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Export</CardTitle>
          <CardDescription>Download system data and reports.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground bg-slate-50 p-6 rounded border flex flex-col items-center justify-center space-y-4">
              <p className="text-center">Export all users, goal sheets, and specific goals to an Excel workbook.</p>
              <Button 
                onClick={handleExport} 
                disabled={isExporting} 
                className="bg-[#2ECC71] hover:bg-green-600 text-white w-full sm:w-auto"
              >
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                {isExporting ? "Exporting..." : "Export Excel Report"}
              </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
