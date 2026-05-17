"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateSystemWindows } from "./actions";

export function AdminSettingsClient({ initialWindows }: { initialWindows: any }) {
  const [windows, setWindows] = useState(initialWindows || {});
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (key: string, checked: boolean) => {
    const newWindows = { ...windows, [key]: { active: checked } };
    setWindows(newWindows);
    
    setIsUpdating(true);
    try {
      await updateSystemWindows(newWindows);
      toast.success(`${key} window ${checked ? 'opened' : 'closed'} successfully.`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update configuration");
      // Revert on failure
      setWindows(windows);
    } finally {
      setIsUpdating(false);
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
            <div className="text-sm text-muted-foreground bg-slate-50 p-4 rounded border">
              Exporting features will be available after cycle completion.
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
