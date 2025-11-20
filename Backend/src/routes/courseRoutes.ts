import express from 'express';
import { getCourses, createCourse, updateCourse, deleteCourse, getCoursesBySemesterAndDepartment, getCoursesByDepartment, getCoursesById } from './../controllers/courseController';
import { authMiddleware, roleMiddleware } from './../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getCourses);
router.post('/', authMiddleware, roleMiddleware(['HOD', 'Admin']), createCourse);
router.put('/:id', authMiddleware, roleMiddleware(['HOD', 'Admin']), updateCourse);
router.delete('/:id', authMiddleware, roleMiddleware(['HOD', 'Admin']), deleteCourse);
router.get('/:courseId', getCoursesById);
router.get('/department/:departmentId', getCoursesByDepartment);
router.get('/semester/:semester/department/:departmentId', getCoursesBySemesterAndDepartment);

export default router;