import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCourseStore } from "../store/courseStore";
import Input from "../components/Input";
import Button from "../components/Button";

// const CourseUpdate: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const [name, setName] = useState('');
//   const [code, setCode] = useState('');
//   const [department, setDepartment] = useState('');
//   const { courses, fetchCourses, updateCourse } = useCourseStore();

//   useEffect(() => {
//     fetchCourses();
//   }, [fetchCourses]);

//   useEffect(() => {
//     const course = courses.find((c) => c.id === parseInt(id!));
//     if (course) {
//       setName(course.name);
//       setCode(course.code);
//       setDepartment(course.department);
//     }
//   }, [courses, id]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await updateCourse(parseInt(id!), { name, code, department });
//       alert('Course updated successfully!');
//     } catch (error) {
//       console.error('Failed to update course:', error);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10">
//       <h2 className="text-2xl font-bold mb-4">Update Course</h2>
//       <form onSubmit={handleSubmit}>
//         <Input
//           label="Course Name"
//           type="text"
//           required
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />
//         <Input
//           label="Course Code"
//           type="text"
//           required
//           value={code}
//           onChange={(e) => setCode(e.target.value)}
//         />
//         <Input
//           label="Department"
//           type="text"
//           required
//           value={department}
//           onChange={(e) => setDepartment(e.target.value)}
//         />
//         <Button type="submit">Update Course</Button>
//       </form>
//     </div>
//   );
// };
const CourseUpdate: React.FC = () => {
  return 0;
};
export default CourseUpdate;
