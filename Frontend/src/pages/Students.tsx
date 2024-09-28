// Frontend/src/pages/Students.tsx

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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";

const StudentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [division, setDivision] = useState("");
  const [batch, setBatch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDropdownOptions();
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [department, semester, division, batch]);

  const fetchDropdownOptions = async () => {
    try {
      const [deptRes, semRes, divRes, batchRes] = await Promise.all([
        api.get("/students/departments"),
        api.get("/students/semesters"),
        api.get("/students/divisions"),
        api.get("/students/batches"),
      ]);
      setDepartments(deptRes.data);
      setSemesters(semRes.data);
      setDivisions(divRes.data);
      setBatches(batchRes.data);
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dropdown options. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [department, semester, division, batch]);

  const fetchStudents = async () => {
    try {
      const response = await api.get("/students", {
        params: { department, semester, division, batch },
      });
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to fetch students. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredStudents = students.filter((student) =>
    student.roll_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (student) => {
    setEditingStudent(student);
  };

  const handleUpdate = async (updatedStudent) => {
    try {
      await api.put(`/students/${updatedStudent.student_id}`, updatedStudent);
      toast({
        title: "Success",
        description: "Student updated successfully.",
      });
      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: "Failed to update student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await api.delete(`/students/${studentId}`);
        toast({
          title: "Success",
          description: "Student deleted successfully.",
        });
        fetchStudents();
      } catch (error) {
        console.error("Error deleting student:", error);
        toast({
          title: "Error",
          description: "Failed to delete student. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewSubmissions = (studentId) => {
    navigate(`/studentSubmissions/${studentId}`);
  };

  return (
    <div className="container mx-auto mt-4 p-4">
      <h1 className="text-2xl font-bold mb-4">Students</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-4">
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger>
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id.toString()}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={semester} onValueChange={setSemester}>
          <SelectTrigger>
            <SelectValue placeholder="Select Semester" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((sem) => (
              <SelectItem key={sem} value={sem.toString()}>
                Semester {sem}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={division} onValueChange={setDivision}>
          <SelectTrigger>
            <SelectValue placeholder="Select Division" />
          </SelectTrigger>
          <SelectContent>
            {divisions.map((div) => (
              <SelectItem key={div} value={div}>
                Division {div}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={batch} onValueChange={setBatch}>
          <SelectTrigger>
            <SelectValue placeholder="Select Batch" />
          </SelectTrigger>
          <SelectContent>
            {batches.map((b) => (
              <SelectItem key={b} value={b}>
                Batch {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="text"
          placeholder="Search by Roll ID"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Roll ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.student_id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.roll_id}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.semester}</TableCell>
                <TableCell>{student.division}</TableCell>
                <TableCell>{student.batch}</TableCell>
                <TableCell>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => handleEdit(student)}
                        >
                          Edit
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Edit Student</DrawerTitle>
                          <DrawerDescription>
                            Make changes to student details here.
                          </DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4 space-y-4">
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={editingStudent?.name || ""}
                              onChange={(e) =>
                                setEditingStudent({
                                  ...editingStudent,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              value={editingStudent?.email || ""}
                              onChange={(e) =>
                                setEditingStudent({
                                  ...editingStudent,
                                  email: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="semester">Semester</Label>
                            <Input
                              id="semester"
                              value={editingStudent?.semester || ""}
                              onChange={(e) =>
                                setEditingStudent({
                                  ...editingStudent,
                                  semester: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="division">Division</Label>
                            <Input
                              id="division"
                              value={editingStudent?.division || ""}
                              onChange={(e) =>
                                setEditingStudent({
                                  ...editingStudent,
                                  division: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <DrawerFooter>
                          <Button onClick={() => handleUpdate(editingStudent)}>
                            Save changes
                          </Button>
                          <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(student.student_id)}
                    >
                      Delete
                    </Button>
                    <Button
                      onClick={() => handleViewSubmissions(student.student_id)}
                    >
                      View Submissions
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StudentsPage;
