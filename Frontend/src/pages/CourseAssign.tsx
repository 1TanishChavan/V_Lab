import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourseStore } from "../store/courseStore";
import { useDepartmentStore } from "../store/departmentStore";
// Removed unused authStore import
// import { useAuthStore } from "../store/authStore";
import { getBatchesByDepartmentAndSemeter } from "@/services/api"; // Ensure this path is correct
import api from "../services/api";
import { ChevronDown, Slash, Loader2 } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { Button } from "../components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { toast } from "../components/hooks/use-toast";

interface Faculty {
  user_id: number;
  department_id: number;
  username: string;
}

interface Batch {
  batch_id: number;
  department_id: number;
  semester: number;
  division: string;
  batch: string;
}

interface Assignment {
  course_id: number;
  faculty_id: number;
  batch_id: number;
}

const CourseAssign: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [assignments, setAssignments] = useState<{ [key: string]: number }>({});
  const [selectedFaculty, setSelectedFaculty] = useState<{
    [key: string]: number;
  }>({});
  const [coursesByDepartment, setCoursesByDepartment] = useState<any[]>([]);

  // Stores
  const { courses, fetchCoursesById } = useCourseStore();
  const { departments, fetchDepartments } = useDepartmentStore();

  // Derived Data
  const course = courses.find((c) => c.course_id.toString() === courseId);
  const department = departments.find(
    (d) => d.department_id === course?.department_id
  );

  // 1. Initial Data Load (Course & Departments)
  useEffect(() => {
    if (courseId) {
      if (!course) {
        fetchCoursesById(parseInt(courseId));
      }
      if (departments.length === 0) {
        fetchDepartments();
      }
    }
  }, [
    courseId,
    course,
    departments.length,
    fetchCoursesById,
    fetchDepartments,
  ]);

  // 2. Fetch Table Data (Parallelized)
  useEffect(() => {
    const fetchData = async () => {
      if (course && course.department_id) {
        setIsLoading(true);
        try {
          // Execute all requests in parallel for faster loading
          const [facultyRes, batchesRes, assignmentsRes, coursesRes] =
            await Promise.all([
              // 1. Faculty List
              api.get<Faculty[]>(
                `/faculty/department2/${course.department_id}`
              ),

              // 2. Batches
              getBatchesByDepartmentAndSemeter(
                course.department_id,
                course.semester
              ).catch(() => ({ data: [] })), // Fallback to empty if fails

              // 3. Existing Assignments
              api.get<Assignment[]>(`/course-faculty/${courseId}`),

              // 4. Other Courses (for dropdown navigation)
              api.get(`/courses/department/${course.department_id}`),
            ]);

          setFacultyList(facultyRes.data);
          setBatches(batchesRes.data);

          // Process Assignments
          const assignmentsMap = assignmentsRes.data.reduce(
            (acc, assignment) => {
              acc[`${assignment.batch_id}`] = assignment.faculty_id;
              return acc;
            },
            {} as { [key: string]: number }
          );
          setAssignments(assignmentsMap);

          // Process Courses
          setCoursesByDepartment(
            coursesRes.data.filter((c: any) => c.semester === course.semester)
          );
        } catch (error) {
          console.error("Failed to fetch data:", error);
          toast({
            title: "Error",
            description: "Failed to load assignment data.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [courseId, course]); // Runs when course details are ready

  const handleFacultySelect = (batchId: number, facultyId: string) => {
    setSelectedFaculty((prev) => ({
      ...prev,
      [batchId]: parseInt(facultyId),
    }));
  };

  const handleAssign = async (batchId: number) => {
    const facultyId = selectedFaculty[batchId];
    if (!facultyId) {
      toast({
        title: "Error",
        description: "Please select a faculty first.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (assignments[batchId]) {
        // Update existing assignment
        await api.put(`/course-faculty/${courseId}/${batchId}`, {
          faculty_id: facultyId,
        });
      } else {
        // Create new assignment
        await api.post("/course-faculty", {
          course_id: parseInt(courseId!),
          batch_id: batchId,
          faculty_id: facultyId,
        });
      }

      // Update local state to reflect change immediately
      setAssignments((prev) => ({
        ...prev,
        [batchId.toString()]: facultyId,
      }));

      toast({
        title: "Success",
        description: "Faculty assigned successfully!",
      });

      // Clear selection after successful assignment
      setSelectedFaculty((prev) => {
        const newState = { ...prev };
        delete newState[batchId];
        return newState;
      });
    } catch (error) {
      console.error("Failed to assign faculty:", error);
      toast({
        title: "Error",
        description: "Failed to assign faculty. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCourseSelect = (courseId: string) => {
    navigate(`/course-assign/${courseId}`);
  };

  // Initial Loading State (Course/Dept not ready)
  if (!course || !department) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading Course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/courses">Courses</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink>{department.name}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink>Semester {course.semester}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                {course.course_name}
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {coursesByDepartment.length > 0 ? (
                  coursesByDepartment.map((c) => (
                    <DropdownMenuItem
                      key={c.course_id}
                      onClick={() => handleCourseSelect(c.course_id)}
                    >
                      {c.course_name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No other courses</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Division</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Faculty</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading assignments...
                  </div>
                </TableCell>
              </TableRow>
            ) : batches.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No batches found for this semester.
                </TableCell>
              </TableRow>
            ) : (
              batches.map((batch) => (
                <TableRow key={batch.batch_id}>
                  <TableCell className="font-medium">
                    {batch.division}
                  </TableCell>
                  <TableCell>{batch.batch}</TableCell>
                  <TableCell className="w-1/3">
                    <Select
                      value={
                        selectedFaculty[batch.batch_id]?.toString() ||
                        (assignments[batch.batch_id]
                          ? assignments[batch.batch_id].toString()
                          : "")
                      }
                      onValueChange={(value) =>
                        handleFacultySelect(batch.batch_id, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Faculty" />
                      </SelectTrigger>
                      <SelectContent>
                        {facultyList.map((faculty) => (
                          <SelectItem
                            key={faculty.user_id}
                            value={faculty.user_id.toString()}
                          >
                            {faculty.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleAssign(batch.batch_id)}
                      disabled={!selectedFaculty[batch.batch_id]}
                      size="sm"
                    >
                      {assignments[batch.batch_id] ? "Update" : "Assign"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CourseAssign;
