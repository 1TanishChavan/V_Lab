import React, { useEffect, useState } from "react";
import { useDepartmentStore, Department } from "../store/departmentStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Card, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "../components/hooks/use-toast";

const DepartmentComponent: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [departmentName, setDepartmentName] = useState("");

  const { toast } = useToast();

  // Store Selectors
  const departments = useDepartmentStore((state) => state.departments);
  const fetchDepartments = useDepartmentStore(
    (state) => state.fetchDepartments
  );
  const createDepartment = useDepartmentStore(
    (state) => state.createDepartment
  );
  const updateDepartment = useDepartmentStore(
    (state) => state.updateDepartment
  );
  const deleteDepartment = useDepartmentStore(
    (state) => state.deleteDepartment
  );

  // Load Data Only if Needed
  useEffect(() => {
    if (departments.length === 0) {
      fetchDepartments();
    }
  }, [fetchDepartments, departments.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentName.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateDepartment(editingId, departmentName);
        toast({
          title: "Updated",
          description: "Department updated successfully.",
        });
      } else {
        await createDepartment(departmentName);
        toast({
          title: "Created",
          description: "Department created successfully.",
        });
      }
      resetForm();
      setIsDrawerOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save department.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingId(department.department_id);
    setDepartmentName(department.name);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (departmentId: number) => {
    try {
      await deleteDepartment(departmentId);
      toast({
        title: "Deleted",
        description: "Department deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete department.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setDepartmentName("");
  };

  return (
    <div className="container mx-auto mt-4 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Departments</h2>
        <Button
          onClick={() => {
            resetForm();
            setIsDrawerOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(departments) && departments.length > 0 ? (
          departments.map((department) => (
            <Card
              key={department.department_id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <CardTitle
                  className="cursor-pointer hover:text-primary text-lg"
                  onClick={() => handleEdit(department)}
                >
                  {department.name}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(department)}
                  title="Edit"
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" title="Delete">
                      <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Department?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the <strong>{department.name}</strong>{" "}
                        department.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleDelete(department.department_id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
            No departments available. Add one to get started.
          </div>
        )}
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>
                {editingId ? "Edit Department" : "Add Department"}
              </DrawerTitle>
              <DrawerDescription>
                {editingId
                  ? "Update the department name below."
                  : "Enter the name for the new department."}
              </DrawerDescription>
            </DrawerHeader>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="deptName" className="text-sm font-medium">
                  Department Name
                </label>
                <Input
                  id="deptName"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="e.g. Computer Science"
                  required
                  autoFocus
                />
              </div>

              <DrawerFooter className="px-0 pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingId ? "Update" : "Create"}
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

export default DepartmentComponent;
