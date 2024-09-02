import React, { useState } from "react";
import { useCourseStore } from "../store/courseStore";
import Input from "../components/Input";
import Button from "../components/Button";
import CourseList from "../components/CourseList";

// const CourseCreation: React.FC = () => {
//   const [name, setName] = useState('');
//   const [code, setCode] = useState('');
//   const [department, setDepartment] = useState('');
//   const createCourse = useCourseStore((state) => state.createCourse);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await createCourse({ name, code, department });
//       setName('');
//       setCode('');
//       setDepartment('');
//       alert('Course created successfully!');
//     } catch (error) {
//       console.error('Failed to create course:', error);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10">
//       <h2 className="text-2xl font-bold mb-4">Create New Course</h2>
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
//         <Button type="submit">Create Course</Button>
//       </form>
//       <div className="mt-8">
//         <h3 className="text-xl font-bold mb-4">Existing Courses</h3>
//         <CourseList />
//       </div>
//     </div>
//   );
// };
const CourseCreation: React.FC = () => {
  return 0;
};
export default CourseCreation;
