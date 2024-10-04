import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "@/components/hooks/use-toast";
import bcrypt from "bcryptjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import Modal components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useFacultyStore from "../store/facultyStore";

const FacultyPage = () => {
  const {
    faculty,
    departments,
    fetchDepartments,
    fetchFaculty,
    addFaculty,
    deleteFaculty,  // Add delete function from your store
    isLoading,
    error,
  } = useFacultyStore();

  const [department, setDepartment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false); // Modal state for Faculty
  const [isHODModalOpen, setIsHODModalOpen] = useState(false); // Modal state for HOD
  const [newFaculty, setNewFaculty] = useState({
    username: "",
    email: "",
    password: "", // Added password
    department_id: "",
    role: "faculty", // Default role for Faculty
  });
  const [newHOD, setNewHOD] = useState({
    username: "",
    email: "",
    password: "",
    department_id: "",
    role: "HOD", // Default role for HOD
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments(); // Fetch departments on component mount
  }, []);

  useEffect(() => {
    fetchFaculty(department); // Fetch faculty whenever the department is changed
  }, [department]);

  // Handle search input change
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter faculty based on search query
  const filteredFaculty = faculty.filter((member) =>
    member.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle input changes for both Faculty and HOD forms
  const handleInputChange = (e, isHOD = false) => {
    const { name, value } = e.target;
    if (isHOD) {
      setNewHOD({ ...newHOD, [name]: value });
    } else {
      setNewFaculty({ ...newFaculty, [name]: value });
    }
  };

  // Handle addition of Faculty
  const handleAddFaculty = async () => {
    try {
      const hashedPassword = await bcrypt.hash(newFaculty.password, 10);
      const facultyData  = { ...newFaculty, password: hashedPassword }; 

      await addFaculty(facultyData);
      toast({
        title: "Success",
        description: "Faculty added successfully.",
        variant: "success",
      });
      setIsFacultyModalOpen(false); // Close modal after adding
      setNewFaculty({
        username: "",
        email: "",
        password: "",
        department_id: "",
        role: "faculty",
      }); // Reset the form
    } catch (error) {
      console.error("Error adding faculty:", error);
      const message = error?.message || "Failed to add faculty. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  // Handle addition of HOD
  const handleAddHOD = async () => {
    try {
      const hashedPassword = await bcrypt.hash(newHOD.password, 10);
      const hodData = { ...newHOD, password: hashedPassword };

      await addFaculty(hodData);
      toast({
        title: "Success",
        description: "HOD added successfully.",
        variant: "success",
      });
      setIsHODModalOpen(false); // Close modal after adding
      setNewHOD({
        username: "",
        email: "",
        password: "",
        department_id: "",
        role: "HOD",
      }); // Reset the form
    } catch (error) {
      console.error("Error adding HOD:", error);
      const message = error?.message || "Failed to add HOD. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  // Handle deletion of faculty
  const handleDeleteFaculty = async (facultyId) => {
    if (!window.confirm("Are you sure you want to delete this faculty member?")) {
      return;
    }
    try {
      await deleteFaculty(facultyId); // Call the store function to delete the faculty
      toast({
        title: "Deleted",
        description: "Faculty member has been deleted.",
        variant: "success",
      });
    } catch (error) {
      console.error("Error deleting faculty:", error);
      toast({
        title: "Error",
        description: "Failed to delete faculty. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto mt-4 p-4">
      <h1 className="text-2xl font-bold mb-4">Faculty and HOD Management</h1>
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Department Select */}
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dep) => (
              <SelectItem key={dep.department_id} value={dep.department_id}>
                {dep.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search Input */}
        <Input
          type="text"
          placeholder="Search by Username"
          value={searchQuery}
          onChange={handleSearch}
          className="w-[200px]"
        />

        {/* Add Faculty Button */}
        <Dialog open={isFacultyModalOpen} onOpenChange={setIsFacultyModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsFacultyModalOpen(true)}>Add Faculty</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Faculty</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="text"
                name="username"
                placeholder="Username"
                value={newFaculty.username}
                onChange={(e) => handleInputChange(e)}
                required
              />
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={newFaculty.email}
                onChange={(e) => handleInputChange(e)}
                required
              />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={newFaculty.password}
                onChange={(e) => handleInputChange(e)}
                required
              />
              <Select
                value={newFaculty.department_id}
                onValueChange={(value) => setNewFaculty({ ...newFaculty, department_id: value })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dep) => (
                    <SelectItem key={dep.department_id} value={dep.department_id}>
                      {dep.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleAddFaculty}>Add</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add HOD Button */}
        <Dialog open={isHODModalOpen} onOpenChange={setIsHODModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsHODModalOpen(true)}>Add HOD</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add HOD</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="text"
                name="username"
                placeholder="Username"
                value={newHOD.username}
                onChange={(e) => handleInputChange(e, true)}
                required
              />
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={newHOD.email}
                onChange={(e) => handleInputChange(e, true)}
                required
              />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={newHOD.password}
                onChange={(e) => handleInputChange(e, true)}
                required
              />
              <Select
                value={newHOD.department_id}
                onValueChange={(value) => setNewHOD({ ...newHOD, department_id: value })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dep) => (
                    <SelectItem key={dep.department_id} value={dep.department_id}>
                      {dep.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleAddHOD}>Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Faculty Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Actions</TableHead> {/* New Actions column */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFaculty.map((member) => (
            <TableRow key={member.faculty_id}>
              <TableCell>{member.username}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                {/* Delete button */}
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteFaculty(member.faculty_id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FacultyPage;
