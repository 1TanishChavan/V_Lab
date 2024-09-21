import express from 'express';
import { getFacultyByDepartment, getAllFaculty, getFacultyBatches } from 'controllers/facultyController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/department/:departmentId', authMiddleware, getFacultyByDepartment);
router.get('/all', authMiddleware, getAllFaculty);
router.get('/batches', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getFacultyBatches);

export default router;