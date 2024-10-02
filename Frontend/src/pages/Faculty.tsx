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
      isLoading,
      error,
    } = useFacultyStore();
    // const [faculty, setFaculty] = useState([]);
    // const [departments, setDepartments] = useState([]);
    const [department, setDepartment] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const [newFaculty, setNewFaculty] = useState({
      username: "",
      email: "",
      password: "", // Added password
      department_id: "",
      role: "faculty", // Default role
    });
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
      fetchDepartments(); // Fetch departments on component mount
    }, []);

    useEffect(() => {
      fetchFaculty(department); // Fetch faculty whenever the department is changed
    }, [department]);

    // // Fetch departments
    // const fetchDepartments = async () => {
    //   try {
    //     const response = await api.get("/departments");
    //     console.log("Departments data:", response.data); // Add this line
    //     setDepartments(response.data);
    //   } catch (error) {
    //     console.error("Error fetching departments:", error);
    //     toast({
    //       title: "Error",
    //       description: "Failed to fetch departments. Please try again.",
    //       variant: "destructive",
    //     });
    //   }
    // };

    // Fetch faculty (by department if selected)
    // const fetchFaculty = async () => {
    //   try {
    //     const endpoint = department ? `/faculty/department/${department}` : "/faculty/all";
    //     const response = await api.get(endpoint);
    //     console.log("Faculty data:", response.data); // Add this line
    //     setFaculty(response.data);
    //   } catch (error) {
    //     console.error("Error fetching faculty:", error);
    //     toast({
    //       title: "Error",
    //       description: "Failed to fetch faculty. Please try again.",
    //       variant: "destructive",
    //     });
    //   }
    // };

    // Handle search input change
    const handleSearch = (e) => {
      setSearchQuery(e.target.value);
    };

    // Filter faculty based on search query
    const filteredFaculty = faculty.filter((member) =>
      member.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle faculty input changes
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewFaculty({ ...newFaculty, [name]: value });
    };

    // Handle faculty addition
    const handleAddFaculty = async () => {
      try {
        await addFaculty(newFaculty);
        toast({
          title: "Success",
          description: "Faculty added successfully.",
          variant: "success",
        });
        setIsModalOpen(false); // Close modal after adding
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

          {/* Add Faculty Button */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsModalOpen(true)}>Add Faculty</Button>
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
                  onChange={handleInputChange}
                  required
                />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={newFaculty.email}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={newFaculty.password}
                  onChange={handleInputChange}
                  required
                />
                <Select
                  value={newFaculty.department_id}
                  onValueChange={(value) => setNewFaculty({ ...newFaculty, department_id: value })}>
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
                  <TableCell>
                    {departments.find(dep => dep.department_id === member.department_id)?.name || "Unknown"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  export default FacultyPage
