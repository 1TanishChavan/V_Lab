import express from 'express';
import { getStudentsByBatch, getStudentByRollId, getStudentsByDepartmentAndSemester } from 'controllers/studentController';
import { authMiddleware } from 'middlewares/authMiddleware';

const router = express.Router();

router.get('/batch/:batchId', authMiddleware, getStudentsByBatch);
router.get('/roll/:rollId', authMiddleware, getStudentByRollId);
router.get('/department/:departmentId/semester/:semester', authMiddleware, getStudentsByDepartmentAndSemester);

export default router;