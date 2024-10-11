import { useEffect, useState } from "react";
import useStudentStore from "../store/studentStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";

const StudentsPage = () => {
  const {
    students,
    isLoading,
    fetchStudents,
    fetchDepartments,
    fetchSemesters,
    fetchDivisions,
    fetchBatches,
    departments,
    semesters,
    divisions,
    batches,
  } = useStudentStore();

  const [filters, setFilters] = useState({
    department: "",
    semester: "",
    division: "",
    batch: "",
  });

  // Fetch dropdown data when the component mounts
  useEffect(() => {
    fetchDepartments();
    fetchSemesters();
    fetchDivisions();
    fetchBatches();
    fetchStudents(filters); // Initial fetch for students
  }, []);

  useEffect(() => {
    fetchStudents(filters); // Fetch students whenever filters change
  }, [filters]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto mt-4 p-4">
      <h1 className="text-2xl font-bold mb-4">Students List</h1>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 mb-4">
        <Select
          value={filters.department}
          onValueChange={(value) => handleFilterChange("department", value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((department: any) => (
              <SelectItem
                key={department.department_id}
                value={department.department_id}
              >
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.semester}
          onValueChange={(value) => handleFilterChange("semester", value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Semester" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((semester: any) => (
              <SelectItem key={semester.id} value={semester.id}>
                {semester.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.division}
          onValueChange={(value) => handleFilterChange("division", value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Division" />
          </SelectTrigger>
          <SelectContent>
            {divisions.map((division: any) => (
              <SelectItem key={division.id} value={division.id}>
                {division.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.batch}
          onValueChange={(value) => handleFilterChange("batch", value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Batch" />
          </SelectTrigger>
          <SelectContent>
            {batches.map((batch: any) => (
              <SelectItem key={batch.id} value={batch.id}>
                {batch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search Box */}
      <div className="mb-4">
        <Input type="text" placeholder="Search Students" className="w-full" />
      </div>

      {/* Loading Indicator */}
      {isLoading && <p>Loading students...</p>}

      {/* Students Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>Division</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.student_id}>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{student.batch}</TableCell>
              <TableCell>{student.semester}</TableCell>
              <TableCell>{student.division}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StudentsPage;
