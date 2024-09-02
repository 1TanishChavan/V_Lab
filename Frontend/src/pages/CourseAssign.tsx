import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCourseStore } from "../store/courseStore";
import { useDepartmentStore } from "../store/departmentStore";
import { useAuthStore } from "../store/authStore";
import { getBatchesByDepartmentAndSemeter } from "@/services/api";
import api from "../services/api";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/hooks/use-toast";

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
  const { courseId } = useParams<{ courseId: string }>();
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [assignments, setAssignments] = useState<{ [key: string]: number }>({});

  const course = useCourseStore((state) =>
    state.courses.find((c) => c.course_id.toString() === courseId)
  );
  const department = useDepartmentStore((state) =>
    state.departments.find((d) => d.department_id === course?.department_id)
  );
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      if (course && user?.department_id) {
        try {
          const facultyResponse = await api.get<Faculty[]>("/faculty/all");
          setFacultyList(facultyResponse.data);

          const batchResponse = await getBatchesByDepartmentAndSemeter(
            course.department_id,
            course.semester
          );
          setBatches(batchResponse.data);

          const assignmentsResponse = await api.get<Assignment[]>(
            `/course-faculty/${courseId}`
          );
          const assignmentsMap = assignmentsResponse.data.reduce(
            (acc, assignment) => {
              acc[`${assignment.batch_id}`] = assignment.faculty_id;
              return acc;
            },
            {} as { [key: string]: number }
          );
          setAssignments(assignmentsMap);
        } catch (error) {
          console.error("Failed to fetch data:", error);
        }
      }
    };
    fetchData();
  }, [courseId, course, user]);

  const handleAssign = async (batchId: number, facultyId: number) => {
    try {
      await api.post("/course-faculty", {
        course_id: parseInt(courseId!),
        batch_id: batchId,
        faculty_id: facultyId,
      });
      setAssignments((prev) => ({
        ...prev,
        [batchId.toString()]: facultyId,
      }));
      toast({
        title: "Faculty assigned successfully!",
        description: "The faculty has been assigned to the course.",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUndo(batchId)}
          >
            Undo
          </Button>
        ),
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

  const handleUndo = async (batchId: number) => {
    try {
      await api.delete(`/course-faculty/${courseId}/${batchId}`);
      setAssignments((prev) => {
        const newAssignments = { ...prev };
        delete newAssignments[batchId.toString()];
        return newAssignments;
      });
      toast({
        title: "Assignment undone",
        description: "The faculty assignment has been removed.",
      });
    } catch (error) {
      console.error("Failed to undo assignment:", error);
      toast({
        title: "Error",
        description: "Failed to undo assignment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!course || !department) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/courses">
            Courses
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>Assign</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>Semester {course.semester}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{course.course_name}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <h2 className="text-2xl font-bold mb-4">Assign Faculty to Course</h2>
      <div className="mb-6">
        <p>
          <strong>Department:</strong> {department.name}
        </p>
        <p>
          <strong>Course:</strong> {course.course_name} ({course.course_code})
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[10%]">Division</TableHead>
              <TableHead className="w-[10%]">Batch</TableHead>
              <TableHead className="w-[60%]">Faculty</TableHead>
              <TableHead className="w-[10%]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch) => (
              <TableRow key={batch.batch_id}>
                <TableCell>{batch.division}</TableCell>
                <TableCell>{batch.batch}</TableCell>
                <TableCell>
                  <Select
                    onValueChange={(value) =>
                      handleAssign(batch.batch_id, parseInt(value))
                    }
                    value={assignments[batch.batch_id]?.toString() || ""}
                  >
                    <SelectTrigger className="w-full">
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
                    onClick={() =>
                      handleAssign(batch.batch_id, assignments[batch.batch_id])
                    }
                    disabled={!assignments[batch.batch_id]}
                  >
                    Assign
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CourseAssign;
