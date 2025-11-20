import { create } from 'zustand';
import api from '../services/api';

export interface Course {
    course_id: number;
    course_name: string;
    course_code: string;
    semester: number;
    department_id: number;
}

interface CourseState {
    courses: Course[];
    fetchCourses: () => Promise<void>;
    fetchCoursesById: (id: number) => Promise<void>;
    createCourse: (courseData: Partial<Course>) => Promise<void>;
    updateCourse: (id: number, courseData: Partial<Course>) => Promise<void>;
    deleteCourse: (id: number) => Promise<void>;
    fetchCoursesByDepartment: (department_id: number) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
    courses: [],
    fetchCourses: async () => {
        try {
            const response = await api.get('/courses');
            set({ courses: response.data });
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    },
    fetchCoursesById: async (id) => {
        try {
            const response = await api.get(`/courses/${id}`);
            // The API returns an array like [{...course}], so we take the first item
            const fetchedCourse = response.data[0];

            if (!fetchedCourse) return;

            set((state) => {
                const exists = state.courses.find(c => c.course_id === id);
                if (exists) {
                    // Update existing
                    return {
                        courses: state.courses.map((course) =>
                            course.course_id === id ? { ...course, ...fetchedCourse } : course
                        ),
                    };
                } else {
                    // Add new
                    return {
                        courses: [...state.courses, fetchedCourse]
                    };
                }
            });
        } catch (error) {
            console.error('Failed to update course:', error);
            throw error;
        }
    },
    createCourse: async (courseData) => {
        try {
            const response = await api.post('/courses', courseData);
            set((state) => ({ courses: [...state.courses, response.data] }));
        } catch (error) {
            console.error('Failed to create course:', error);
            throw error;
        }
    },
    updateCourse: async (id, courseData) => {
        try {
            const response = await api.put(`/courses/${id}`, courseData);
            set((state) => ({
                courses: state.courses.map((course) =>
                    course.course_id === id ? { ...course, ...response.data } : course
                ),
            }));
        } catch (error) {
            console.error('Failed to update course:', error);
            throw error;
        }
    },
    deleteCourse: async (id) => {
        try {
            await api.delete(`/courses/${id}`);
            set((state) => ({
                courses: state.courses.filter((course) => course.course_id !== id),
            }));
        } catch (error) {
            console.error('Failed to delete course:', error);
            throw error;
        }
    },
    fetchCoursesByDepartment: async (departmentId) => {
        try {
            const response = await api.get(`/courses/department/${departmentId}`);
            set({ courses: response.data });
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    },
}));