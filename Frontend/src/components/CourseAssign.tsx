import React, { useState, useEffect } from "react";
import { useBatchStore } from "../store/batchStore";
import { useAuthStore } from "../store/authStore";
import Dropdown from "../components/Dropdown";
import Button from "../components/Button";
import api from "../services/api";

interface CourseAssignProps {
  courseId: number;
  courseName: string;
  semester: number;
  departmentId: number;
  departmentName: string;
  onClose: () => void;
}

const CourseAssign: React.FC<CourseAssignProps> = ({
  courseId,
  courseName,
  semester,
  departmentId,
  departmentName,
  onClose,
}) => {
  const [batches, setBatches] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  const fetchBatchesByDepartmentAndSemester = useBatchStore(
    (state) => state.fetchBatchesByDepartmentAndSemester
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const batchesResponse = await fetchBatchesByDepartmentAndSemester(
          departmentId,
          semester
        );
        setBatches(batchesResponse);

        const facultyResponse = await api.get("/faculty");
        setFacultyList(facultyResponse.data);

        const assignmentsResponse = await api.get(
          `/course-faculty/${courseId}`
        );
        const assignmentsMap = assignmentsResponse.data.reduce(
          (acc, assignment) => {
            acc[`${assignment.division}_${assignment.batch}`] =
              assignment.faculty_id.toString();
            return acc;
          },
          {}
        );
        setAssignments(assignmentsMap);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [courseId, departmentId, semester, fetchBatchesByDepartmentAndSemester]);

  const handleAssign = async (
    division: string,
    batch: string,
    facultyId: string
  ) => {
    try {
      await api.post("/course-faculty", {
        course_id: courseId,
        batch_id: batches.find(
          (b) => b.division === division && b.batch === batch
        ).batch_id,
        faculty_id: parseInt(facultyId),
      });
      setAssignments({ ...assignments, [`${division}_${batch}`]: facultyId });
      alert("Course assigned successfully!");
    } catch (error) {
      console.error("Failed to assign course:", error);
    }
  };

  const facultyOptions = facultyList.map((faculty) => ({
    value: faculty.faculty_id.toString(),
    label: faculty.username,
  }));

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Assign Course to Faculty</h2>
      <p>
        <strong>Department:</strong> {departmentName}
      </p>
      <p>
        <strong>Semester:</strong> {semester}
      </p>
      <p>
        <strong>Course:</strong> {courseName}
      </p>
      <div className="mt-4">
        {batches.map((batch) => (
          <div
            key={`${batch.division}_${batch.batch}`}
            className="mb-4 flex items-center"
          >
            <span className="w-24">Division {batch.division}:</span>
            <span className="w-24">Batch {batch.batch}:</span>
            <Dropdown
              options={facultyOptions}
              onChange={(value) =>
                handleAssign(batch.division, batch.batch, value)
              }
              value={assignments[`${batch.division}_${batch.batch}`] || ""}
              placeholder="Select Faculty"
            />
            {assignments[`${batch.division}_${batch.batch}`] && (
              <span className="ml-2 text-green-600">✓ Assigned</span>
            )}
          </div>
        ))}
      </div>
      <Button onClick={onClose}>Close</Button>
    </div>
  );
};

export default CourseAssign;
