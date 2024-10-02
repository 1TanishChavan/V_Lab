import express from 'express';
import {
    addFaculty,
    getFacultyByDepartment,
    getAllFaculty,
    getFacultyBatches,
} from '../controllers/facultyController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// Create a new faculty member (Admin/HOD access)
router.post('/', authMiddleware, roleMiddleware(['Admin', 'HOD']), addFaculty);

// Get all faculty members (Admin/HOD access)
router.get('/all', authMiddleware, roleMiddleware(['Admin', 'HOD']), getAllFaculty);

// Get faculty by department
router.get('/department/:departmentId', authMiddleware, getFacultyByDepartment);

// Get faculty batches
router.get('/batches/:facultyId', authMiddleware, getFacultyBatches);

export default router;
