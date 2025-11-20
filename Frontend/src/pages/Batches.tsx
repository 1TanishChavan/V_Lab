import React, { useState, useEffect } from "react";
import api from "../services/api";
import useFacultyStore from "../store/facultyStore";
import { useBatchStore } from "../store/batchStore";

// UI Components
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "../components/ui/drawer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "../components/hooks/use-toast";

// Keep local interface if not exported from types.ts to ensure self-containment during this refactor
interface BatchData {
  batch_id: number;
  department_id: number;
  semester: number;
  division: string;
  batch: string;
}

const BatchesPage: React.FC = () => {
  const { toast } = useToast();
  const { departments, fetchDepartments } = useFacultyStore();
  const { createBatch, deleteBatch } = useBatchStore();

  // Filter States
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterSemester, setFilterSemester] = useState<string>("all");

  // Data States
  const [batches, setBatches] = useState<BatchData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Batch Form States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newBatchData, setNewBatchData] = useState({
    department_id: "",
    semester: "",
    division: "",
    batch: "",
  });

  // Initial Load
  useEffect(() => {
    if (departments.length === 0) {
      fetchDepartments();
    }
  }, [fetchDepartments, departments.length]);

  // Fetch Batches when filters change
  useEffect(() => {
    fetchBatchesData();
  }, [filterDepartment, filterSemester]);

  const fetchBatchesData = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (filterDepartment && filterDepartment !== "all") {
        params.departmentId = filterDepartment;
      }
      if (filterSemester && filterSemester !== "all") {
        params.semester = filterSemester;
      }

      // Using the NEW API endpoint created in previous step
      const response = await api.get("/batches/list", { params });
      setBatches(response.data);
    } catch (error) {
      console.error("Failed to fetch batches:", error);
      toast({
        title: "Error",
        description: "Failed to load batches.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchData.department_id) {
      toast({
        title: "Error",
        description: "Please select a department.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createBatch({
        department_id: parseInt(newBatchData.department_id),
        semester: parseInt(newBatchData.semester),
        division: newBatchData.division.toUpperCase(),
        batch: newBatchData.batch,
      });

      toast({ title: "Success", description: "Batch added successfully." });
      setIsDrawerOpen(false);
      setNewBatchData({
        department_id: "",
        semester: "",
        division: "",
        batch: "",
      });
      fetchBatchesData(); // Refresh list to show new data
    } catch (error) {
      console.error("Failed to add batch:", error);
      toast({
        title: "Error",
        description: "Failed to create batch.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBatch = async (id: number) => {
    if (!confirm("Are you sure you want to delete this batch?")) return;
    try {
      await deleteBatch(id);
      toast({ title: "Deleted", description: "Batch removed successfully." });
      fetchBatchesData(); // Refresh list
    } catch (error) {
      console.error("Failed to delete batch:", error);
      toast({
        title: "Error",
        description: "Could not delete batch.",
        variant: "destructive",
      });
    }
  };

  // Helper to get department name
  const getDeptName = (id: number) => {
    return departments.find((d: any) => d.department_id === id)?.name || id;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Batches & Divisions
          </h1>
          <p className="text-muted-foreground">
            Manage academic batches across departments.
          </p>
        </div>
        <Button onClick={() => setIsDrawerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Batch
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="w-[200px]">
            <Select
              value={filterDepartment}
              onValueChange={setFilterDepartment}
            >
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d: any) => (
                  <SelectItem
                    key={d.department_id}
                    value={d.department_id.toString()}
                  >
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-[200px]">
            <Select value={filterSemester} onValueChange={setFilterSemester}>
              <SelectTrigger>
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <SelectItem key={sem} value={sem.toString()}>
                    Semester {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setFilterDepartment("all");
              setFilterSemester("all");
            }}
          >
            Reset
          </Button>
        </CardContent>
      </Card>

      {/* Data Table */}
      <div className="rounded-md border bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Division</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : batches.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No batches found.
                </TableCell>
              </TableRow>
            ) : (
              batches.map((b) => (
                <TableRow key={b.batch_id}>
                  <TableCell className="font-medium">{b.division}</TableCell>
                  <TableCell>{b.batch}</TableCell>
                  <TableCell>Sem {b.semester}</TableCell>
                  <TableCell>{getDeptName(b.department_id)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteBatch(b.batch_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Batch Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Add New Batch</DrawerTitle>
              <DrawerDescription>
                Create a new division and batch group.
              </DrawerDescription>
            </DrawerHeader>

            <form onSubmit={handleAddBatch} className="p-4 space-y-4">
              {/* Replaced native Select with Shadcn Select for consistency */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select
                  onValueChange={(val) =>
                    setNewBatchData({ ...newBatchData, department_id: val })
                  }
                  value={newBatchData.department_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d: any) => (
                      <SelectItem
                        key={d.department_id}
                        value={d.department_id.toString()}
                      >
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Semester</label>
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    placeholder="1-8"
                    value={newBatchData.semester}
                    onChange={(e) =>
                      setNewBatchData({
                        ...newBatchData,
                        semester: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Division</label>
                  <Input
                    placeholder="A, B..."
                    value={newBatchData.division}
                    onChange={(e) =>
                      setNewBatchData({
                        ...newBatchData,
                        division: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Batch Name/Number</label>
                <Input
                  placeholder="e.g. 1, 2, B1"
                  value={newBatchData.batch}
                  onChange={(e) =>
                    setNewBatchData({ ...newBatchData, batch: e.target.value })
                  }
                  required
                />
              </div>

              <DrawerFooter className="pt-4 px-0">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Create Batch
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default BatchesPage;
