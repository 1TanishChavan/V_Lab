import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getBatchesByDepartmentAndSemeter } from "../services/api";
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
  const [filters, setFilters] = useState({
    department: "",
    semester: "",
    division: "",
    batch: "",
  });
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters] = useState([1, 2, 3, 4, 5, 6, 7, 8]); // Static semesters
  const [divisions, setDivisions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch departments initially
  useEffect(() => {
    const fetchInitialData = async () => {
      const departmentData = await api.get("/departments");
      setDepartments(departmentData.data);
      fetchStudents(); // Initial student fetch
    };

    fetchInitialData();
  }, []);

  // Fetch students based on filters
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/students", { params: filters });
      setStudents(response.data);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = async (name: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "department"
        ? { semester: "", division: "", batch: "" }
        : {}), // Clear lower-level filters if department changes
      ...(name === "semester" ? { division: "", batch: "" } : {}),
    }));

    // Fetch divisions and batches based on department and semester
    if (name === "department" || name === "semester") {
      const departmentID = filters.department || value;
      const semester = filters.semester || value;

      // if (departmentID && semester) {
      //   const batchData = await getBatchesByDepartmentAndSemeter(
      //     parseInt(departmentID),
      //     parseInt(semester)
      //   );
      //   setBatches(batchData.data);
      // }

      const divisionData = await api.get("/students/divisions");
      setDivisions(divisionData.data);

      const BatchData = await api.get("/students/divisions");
      setBatches(BatchData.data);
    }

    // Refetch students when filters change
    fetchStudents();
  };

  // Navigate to StudentSubmissions page
  const handleStudentClick = (studentID: number) => {
    navigate(`/StudentSubmissions/${studentID}`);
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
          disabled={!filters.department} // Disabled if no department is selected
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Semester" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((semester: number) => (
              <SelectItem key={semester} value={semester.toString()}>
                Semester {semester}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.division}
          onValueChange={(value) => handleFilterChange("division", value)}
          disabled={!filters.semester} // Disabled if no semester is selected
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Division" />
          </SelectTrigger>
          <SelectContent>
            {divisions.map((division: any) => (
              <SelectItem key={division} value={division}>
                {division}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.batch}
          onValueChange={(value) => handleFilterChange("batch", value)}
          disabled={!filters.division} // Disabled if no division is selected
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Batch" />
          </SelectTrigger>
          <SelectContent>
            {batches.map((batch: any) => (
              <SelectItem key={batch} value={batch}>
                {batch}
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
            <TableHead>Semester</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>Batch</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student: any) => (
            <TableRow key={student.student_id}>
              <TableCell>
                <button
                  className="text-blue-500 underline"
                  onClick={() => handleStudentClick(student.student_id)}
                >
                  {student.name}
                </button>
              </TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{student.semester}</TableCell>
              <TableCell>{student.division}</TableCell>
              <TableCell>{student.batch}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StudentsPage;
