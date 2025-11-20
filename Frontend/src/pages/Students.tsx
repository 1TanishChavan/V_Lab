import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
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
import { Loader2, Search } from "lucide-react";
import { Button } from "../components/ui/button";

// Define interfaces locally if not in a shared types file
interface Student {
  student_id: number;
  name: string;
  email: string;
  semester: number;
  division: string;
  batch: string;
}

interface Department {
  department_id: number;
  name: string;
}

interface Batch {
  batch_id: number;
  batch: string;
  division: string;
}

const StudentsPage = () => {
  const navigate = useNavigate();

  // Filter State
  const [filters, setFilters] = useState({
    department: "",
    semester: "",
    division: "",
    batch: "",
  });

  // Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [divisions, setDivisions] = useState<string[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingList, setIsFetchingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Constants
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  // 1. Initial Load (Departments & Divisions)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [deptRes, divRes] = await Promise.all([
          api.get("/departments"),
          api.get("/students/divisions"),
        ]);
        setDepartments(deptRes.data);
        setDivisions(divRes.data);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // 2. Fetch Batches when Department or Semester changes
  useEffect(() => {
    const fetchBatches = async () => {
      if (filters.department && filters.semester) {
        try {
          const response = await api.get(
            `/students/batches/${filters.department}/${filters.semester}`
          );
          setBatches(response.data);
        } catch (error) {
          console.error("Error fetching batches:", error);
          setBatches([]);
        }
      } else {
        setBatches([]);
      }
    };
    fetchBatches();
  }, [filters.department, filters.semester]);

  // 3. Fetch Students when any filter changes
  useEffect(() => {
    const fetchStudents = async () => {
      setIsFetchingList(true);
      try {
        // Filter out empty strings to send clean params
        const activeFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        );

        const response = await api.get("/students", { params: activeFilters });
        setStudents(response.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setIsFetchingList(false);
      }
    };

    // Debounce slightly if needed, or fetch immediately
    fetchStudents();
  }, [filters]);

  // 4. Memoized Search Filter
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const lowerQuery = searchQuery.toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(lowerQuery) ||
        student.email.toLowerCase().includes(lowerQuery)
    );
  }, [students, searchQuery]);

  // Handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };

      // Reset dependent fields logic
      if (key === "department") {
        next.semester = "";
        next.division = "";
        next.batch = "";
      } else if (key === "semester") {
        next.division = "";
        next.batch = "";
      } else if (key === "division") {
        next.batch = "";
      }
      return next;
    });
  };

  const clearFilters = () => {
    setFilters({
      department: "",
      semester: "",
      division: "",
      batch: "",
    });
    setSearchQuery("");
  };

  const handleStudentClick = (studentId: number) => {
    navigate(`/StudentSubmissions/${studentId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-4 p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Students List</h1>
        <Button variant="outline" onClick={clearFilters} size="sm">
          Reset Filters
        </Button>
      </div>

      {/* Filters Container */}
      <div className="bg-card p-4 rounded-lg border shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          value={filters.department}
          onValueChange={(val) => handleFilterChange("department", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem
                key={dept.department_id}
                value={dept.department_id.toString()}
              >
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.semester}
          onValueChange={(val) => handleFilterChange("semester", val)}
          disabled={!filters.department}
        >
          <SelectTrigger>
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((sem) => (
              <SelectItem key={sem} value={sem.toString()}>
                Semester {sem}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.division}
          onValueChange={(val) => handleFilterChange("division", val)}
          disabled={!filters.semester}
        >
          <SelectTrigger>
            <SelectValue placeholder="Division" />
          </SelectTrigger>
          <SelectContent>
            {divisions.map((div) => (
              <SelectItem key={div} value={div}>
                Division {div}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.batch}
          onValueChange={(val) => handleFilterChange("batch", val)}
          disabled={!filters.division}
        >
          <SelectTrigger>
            <SelectValue placeholder="Batch" />
          </SelectTrigger>
          <SelectContent>
            {batches
              .filter(
                (b) => !filters.division || b.division === filters.division
              )
              .map((b) => (
                <SelectItem key={b.batch_id} value={b.batch}>
                  Batch {b.batch}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Batch</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetchingList ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching students...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No students found matching criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow
                  key={student.student_id}
                  className="hover:bg-muted/50"
                >
                  <TableCell>
                    <button
                      className="font-medium text-primary hover:underline text-left"
                      onClick={() => handleStudentClick(student.student_id)}
                    >
                      {student.name}
                    </button>
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>Sem {student.semester}</TableCell>
                  <TableCell>{student.division}</TableCell>
                  <TableCell>{student.batch}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StudentsPage;
