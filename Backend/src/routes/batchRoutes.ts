import express from 'express';
import { getBatches, createBatch, updateBatch, deleteBatch, getBatchesByDepartmentAndSemester } from 'controllers/batchController';
import { authMiddleware, roleMiddleware } from 'middlewares/authMiddleware';

const router = express.Router();

router.get('/', getBatches);
router.post('/', authMiddleware, roleMiddleware(['HOD', 'Faculty']), createBatch);
router.put('/:id', authMiddleware, roleMiddleware(['HOD', 'Faculty']), updateBatch);
router.delete('/:id', authMiddleware, roleMiddleware(['HOD', 'Faculty']), deleteBatch);
router.get('/department/:departmentId/semester/:semester', getBatchesByDepartmentAndSemester);

export default router;