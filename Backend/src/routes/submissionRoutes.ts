import express from 'express';
import {
    createSubmission,
    getSubmissionsByPractical,
    getSubmissionById,
    updateSubmission
} from '../controllers/submissionController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createSubmission);
router.get('/practical/:practicalId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getSubmissionsByPractical);
router.get('/:submissionId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getSubmissionById);
router.put('/:submissionId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), updateSubmission);

export default router;