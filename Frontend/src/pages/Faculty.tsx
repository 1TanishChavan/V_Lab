import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "@/components/hooks/use-toast";
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

const FacultyPage = () => {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();  // Fetch departments on component mount
  }, []);

  useEffect(() => {
    fetchFaculty();  // Fetch faculty whenever the department is changed
  }, [department]);

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments");
      console.log('Departments data:', response.data);  // Add this line
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch departments. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch faculty (by department if selected)
  const fetchFaculty = async () => {
    try {
      const endpoint = department
<<<<<<< HEAD
        ? `/faculty/department/${department}`
=======
        ? /faculty/department/${department}
>>>>>>> 057f0dea7b22e312029694ea5861209c56f297b5
        : "/faculty/all";
      const response = await api.get(endpoint);
      console.log('Faculty data:', response.data);  // Add this line
      setFaculty(response.data);
    } catch (error) {
      console.error("Error fetching faculty:", error);
      toast({
        title: "Error",
        description: "Failed to fetch faculty. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle search input change
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter faculty based on search query
  const filteredFaculty = faculty.filter((member) =>
    member.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto mt-4 p-4">
      <h1 className="text-2xl font-bold mb-4">Faculty</h1>
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
      </div>

      {/* Faculty Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
          </TableRow>
        </TableHeader>
              <TableBody>
        {filteredFaculty.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3}>No faculty found</TableCell>
          </TableRow>
        ) : (
          filteredFaculty.map((member) => (
            <TableRow key={member.user_id}>
              <TableCell>{member.username}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>{member.department_id}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
      </Table>
    </div>
  );
};

<<<<<<< HEAD
export default FacultyPage;
=======
export default FacultyPage;
>>>>>>> 057f0dea7b22e312029694ea5861209c56f297b5
