import express from 'express';
import { getFacultyByDepartment, getAllFaculty } from 'controllers/facultyController';
import { authMiddleware } from 'middlewares/authMiddleware';

const router = express.Router();

router.get('/department/:departmentId', authMiddleware, getFacultyByDepartment);
router.get('/all', authMiddleware, getAllFaculty);

export default router;