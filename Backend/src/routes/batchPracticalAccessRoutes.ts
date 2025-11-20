import express from 'express';
import { getBatchPracticalAccess, createOrUpdateBatchPracticalAccess } from './../controllers/batchPracticalAccessController';
import { authMiddleware, roleMiddleware } from './../middlewares/authMiddleware';

const router = express.Router();

router.get('/:practicalId/:courseId/:facultyId', getBatchPracticalAccess);
router.get('/:practicalId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getBatchPracticalAccess);
router.get('/:practicalId/:facultyId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getBatchPracticalAccess);
router.post('/', authMiddleware, roleMiddleware(['Faculty', 'HOD']), createOrUpdateBatchPracticalAccess);

export default router;