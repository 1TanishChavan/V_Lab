import React, { useState, useEffect, useMemo } from "react";
import { useToast } from "../components/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import useFacultyStore from "../store/facultyStore";
import { useAuthStore } from "../store/authStore";
import { Loader2, Plus, Trash2, Search } from "lucide-react";

// Define types locally or import from types.ts
interface NewUser {
  username: string;
  email: string;
  password: string;
  department_id: string;
  role: "Faculty" | "HOD";
}

const FacultyPage = () => {
  const {
    faculty,
    departments,
    fetchDepartments,
    fetchFaculty,
    addFaculty, // Assuming this store action handles the API call
    deleteFaculty,
    isLoading,
  } = useFacultyStore();

  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();

  // UI State
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [newUser, setNewUser] = useState<NewUser>({
    username: "",
    email: "",
    password: "",
    department_id: "",
    role: "Faculty", // Default
  });

  // 1. Load Initial Data
  useEffect(() => {
    if (departments.length === 0) {
      fetchDepartments();
    }
  }, [fetchDepartments, departments.length]);

  // 2. Fetch Faculty when Department Filter Changes
  useEffect(() => {
    const deptId = departmentFilter === "all" ? undefined : departmentFilter;
    fetchFaculty(deptId);
  }, [fetchFaculty, departmentFilter]);

  // 3. Memoized Search Filtering
  const filteredFaculty = useMemo(() => {
    return faculty.filter(
      (member) =>
        member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [faculty, searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async () => {
    if (
      !newUser.username ||
      !newUser.email ||
      !newUser.password ||
      !newUser.department_id
    ) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Using the store action for consistency.
      // Ensure your store's addFaculty calls the correct endpoint (likely /auth/register or /faculty)
      // If the store expects 'department_id' as number, parse it.
      await addFaculty({
        ...newUser,
        department_id: parseInt(newUser.department_id),
      });

      toast({
        title: "Success",
        description: `${newUser.role} added successfully.`,
      });

      setIsAddModalOpen(false);
      setNewUser({
        username: "",
        email: "",
        password: "",
        department_id: "",
        role: "Faculty",
      });
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: "Failed to add user.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFaculty = async (facultyId: number) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      await deleteFaculty(facultyId);
      toast({ title: "Deleted", description: "Member removed successfully." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete member.",
        variant: "destructive",
      });
    }
  };

  const openModal = (role: "Faculty" | "HOD") => {
    setNewUser((prev) => ({ ...prev, role }));
    setIsAddModalOpen(true);
  };

  // Permission checks
  const canAddFaculty = user?.role === "HOD" || user?.role === "Admin";
  const canAddHOD = user?.role === "Admin";

  return (
    <div className="container mx-auto mt-4 p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Faculty Management
        </h1>
        <div className="flex gap-2">
          {canAddFaculty && (
            <Button onClick={() => openModal("Faculty")}>
              <Plus className="mr-2 h-4 w-4" /> Add Faculty
            </Button>
          )}
          {canAddHOD && (
            <Button variant="secondary" onClick={() => openModal("HOD")}>
              <Plus className="mr-2 h-4 w-4" /> Add HOD
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="w-full sm:w-[250px]">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dep: any) => (
                <SelectItem
                  key={dep.department_id}
                  value={dep.department_id.toString()}
                >
                  {dep.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading faculty...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredFaculty.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No faculty members found.
                </TableCell>
              </TableRow>
            ) : (
              filteredFaculty.map((member) => (
                <TableRow key={member.faculty_id}>
                  <TableCell className="font-medium">
                    {member.username}
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        member.role === "HOD"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {member.role}
                    </span>
                  </TableCell>
                  <TableCell>{member.department}</TableCell>
                  <TableCell className="text-right">
                    {/* Only Admins or HODs can delete */}
                    {(user?.role === "Admin" ||
                      (user?.role === "HOD" && member.role !== "HOD")) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteFaculty(member.faculty_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Unified Add User Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New {newUser.role}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                name="username"
                placeholder="e.g. John Doe"
                value={newUser.username}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                name="email"
                type="email"
                placeholder="john@example.com"
                value={newUser.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                name="password"
                type="password"
                placeholder="••••••••"
                value={newUser.password}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select
                value={newUser.department_id}
                onValueChange={(value) =>
                  setNewUser((prev) => ({ ...prev, department_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dep: any) => (
                    <SelectItem
                      key={dep.department_id}
                      value={dep.department_id.toString()}
                    >
                      {dep.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleAddUser} disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add {newUser.role}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacultyPage;
