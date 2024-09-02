import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourse } from '../services/api';
import { Course } from '../utils/types';
import Button from './Button';

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourse(0); // Assuming 0 fetches all courses
        setCourses(response.data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        <div key={course.course_id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">{course.course_name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{course.course_code}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Semester: {course.semester}</p>
          <div className="mt-4">
            <Link to={`/course-update/${course.course_id}`}>
              <Button variant="secondary">Edit</Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseList;