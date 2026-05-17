"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lock, Plus, Upload, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addGoal, submitGoalSheet, reviewGoalSheet } from "./actions";
import { useRouter } from "next/navigation";

type Goal = {
  id: string;
  title: string;
  thrustArea: string;
  uomType: string;
  target: string;
  weightage: number;
};

type GoalSheet = {
  id: string;
  status: string;
  goals: Goal[];
};

export function GoalSheetView({ initialSheet, isManagerView = false }: { initialSheet: GoalSheet, isManagerView?: boolean }) {
  const router = useRouter();
  const [sheet, setSheet] = useState(initialSheet);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New goal form state
  const [title, setTitle] = useState("");
  const [thrustArea, setThrustArea] = useState("");
  const [uomType, setUomType] = useState("");
  const [target, setTarget] = useState("");
  const [weightage, setWeightage] = useState("");

  const totalWeightage = sheet.goals.reduce((acc: number, g: Goal) => acc + g.weightage, 0);
  
  // For an employee, it's locked if Approved or Submitted.
  // For a manager, they shouldn't edit the goals directly anyway.
  const isLocked = isManagerView || sheet.status === "APPROVED" || sheet.status === "SUBMITTED";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED": return <Badge className="bg-[#2ECC71]">Approved</Badge>;
      case "SUBMITTED": return <Badge className="bg-[#F39C12]">Submitted</Badge>;
      case "RETURNED": return <Badge className="bg-[#E74C3C]">Returned</Badge>;
      default: return <Badge variant="outline">Draft</Badge>;
    }
  };

  const handleAddGoalSubmit = async () => {
    if (!title || !thrustArea || !uomType || !target || !weightage) {
      toast.error("Please fill all fields");
      return;
    }

    const weightNum = parseFloat(weightage);
    if (isNaN(weightNum) || weightNum < 10) {
      toast.error("Weightage must be a number of at least 10");
      return;
    }

    setIsSubmitting(true);
    try {
      const newGoal = await addGoal({
        goalSheetId: sheet.id,
        title,
        thrustArea,
        uomType,
        target,
        weightage: weightNum,
      });

      setSheet({
        ...sheet,
        goals: [...sheet.goals, newGoal]
      });
      
      toast.success("Goal added successfully");
      setIsAddOpen(false);
      
      // Reset form
      setTitle("");
      setThrustArea("");
      setUomType("");
      setTarget("");
      setWeightage("");
    } catch (error) {
      toast.error((error as Error).message || "Failed to add goal");
    } finally {
      setIsSubmitting(false);
      router.refresh();
    }
  };

  const handleSubmit = async () => {
    if (totalWeightage !== 100) {
      toast.error("Total weightage must be exactly 100%");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await submitGoalSheet(sheet.id);
      toast.success("Goal sheet submitted for approval");
      setSheet({ ...sheet, status: "SUBMITTED" });
    } catch (error) {
      toast.error((error as Error).message || "Failed to submit goal sheet");
    } finally {
      setIsSubmitting(false);
      router.refresh();
    }
  };

  const handleReview = async (action: "APPROVE" | "RETURN") => {
    setIsSubmitting(true);
    try {
      await reviewGoalSheet(sheet.id, action);
      toast.success(`Goal sheet ${action === "APPROVE" ? "approved" : "returned"} successfully`);
      setSheet({ ...sheet, status: action === "APPROVE" ? "APPROVED" : "RETURNED" });
    } catch (error) {
      toast.error((error as Error).message || `Failed to ${action.toLowerCase()} goal sheet`);
    } finally {
      setIsSubmitting(false);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle>Goal Sheet 2024</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              {getStatusBadge(sheet.status)}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Weightage</div>
              <div className={`text-xl font-bold ${totalWeightage === 100 ? 'text-[#2ECC71]' : 'text-[#E74C3C]'}`}>
                {totalWeightage}%
              </div>
            </div>
            
            {/* Employee Submit Button */}
            {!isManagerView && !isLocked && (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#2E86AB] hover:bg-[#1E3A5F]">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Submit
              </Button>
            )}

            {/* Manager Review Buttons */}
            {isManagerView && sheet.status === "SUBMITTED" && (
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleReview("RETURN")} 
                  disabled={isSubmitting} 
                  variant="outline"
                  className="text-[#E74C3C] border-[#E74C3C] hover:bg-red-50"
                >
                  <XCircle className="mr-2 h-4 w-4" /> Return
                </Button>
                <Button 
                  onClick={() => handleReview("APPROVE")} 
                  disabled={isSubmitting} 
                  className="bg-[#2ECC71] hover:bg-green-600"
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Approve
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border mt-4">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Thrust Area</TableHead>
                  <TableHead>UoM</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="text-right">Weightage</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sheet.goals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No goals added yet. {isManagerView ? "" : "Add a goal to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  sheet.goals.map((goal: Goal) => (
                    <TableRow key={goal.id}>
                      <TableCell className="font-medium">{goal.title}</TableCell>
                      <TableCell>{goal.thrustArea}</TableCell>
                      <TableCell>{goal.uomType}</TableCell>
                      <TableCell>{goal.target}</TableCell>
                      <TableCell className="text-right">{goal.weightage}%</TableCell>
                      <TableCell className="text-right">
                        {isLocked ? (
                          <Lock className="inline h-4 w-4 text-slate-400" />
                        ) : (
                          <Button variant="ghost" size="sm">Edit</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {!isLocked && (
            <Button variant="outline" className="mt-4 w-full border-dashed" onClick={() => setIsAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Goal
            </Button>
          )}
        </CardContent>
      </Card>

      {sheet.status === "APPROVED" && (
        <Card>
          <CardHeader>
            <CardTitle>Quarterly Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
              Quarterly check-in windows are currently closed.
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Goal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="thrustArea" className="text-right">Thrust Area</Label>
              <Select value={thrustArea} onValueChange={setThrustArea}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Revenue">Revenue</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="People">People</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="uomType" className="text-right">UoM</Label>
              <Select value={uomType} onValueChange={setUomType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Numeric">Numeric</SelectItem>
                  <SelectItem value="Percentage">Percentage</SelectItem>
                  <SelectItem value="Timeline">Timeline</SelectItem>
                  <SelectItem value="Zero-based">Zero-based</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target" className="text-right">Target</Label>
              <Input id="target" value={target} onChange={(e) => setTarget(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weightage" className="text-right">Weightage (%)</Label>
              <Input id="weightage" type="number" min="10" max="100" value={weightage} onChange={(e) => setWeightage(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleAddGoalSubmit} disabled={isSubmitting} className="bg-[#2E86AB] hover:bg-[#1E3A5F]">
              {isSubmitting ? "Adding..." : "Add Goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
