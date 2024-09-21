import express from 'express';
import { getStudentsByBatch, getStudentByRollId, getStudentsByDepartmentAndSemester, getStudentSubmissions } from 'controllers/studentController';
import { authMiddleware, roleMiddleware } from 'middlewares/authMiddleware';

const router = express.Router();

router.get('/batch/:batchId', authMiddleware, getStudentsByBatch);
router.get('/roll/:rollId', authMiddleware, getStudentByRollId);
router.get('/department/:departmentId/semester/:semester', authMiddleware, getStudentsByDepartmentAndSemester);
router.get('/student/:studentId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getStudentSubmissions);

export default router;