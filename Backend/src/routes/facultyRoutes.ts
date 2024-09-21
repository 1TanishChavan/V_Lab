import express from 'express';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from 'controllers/departmentController';
import { getFacultyDetails } from 'controllers/facultyController';
import { getFacultyByDepartment, getAllFaculty, getFacultyBatches } from 'controllers/facultyController';
import { authMiddleware, roleMiddleware } from 'middlewares/authMiddleware';

const router = express.Router();

// Department routes
router.get('/departments', authMiddleware, getDepartments);

// Faculty routes
router.get('/batches', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getFacultyBatches);
router.get('/:facultyId', authMiddleware, getFacultyDetails);
router.get('/department/:departmentId', authMiddleware, getFacultyByDepartment);
router.get('/all', authMiddleware, getAllFaculty);

export default router;
