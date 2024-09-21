import express from 'express';
import {
    createSubmission,
    getSubmissionsByPractical,
    getSubmissionById,
    updateSubmission,
    getStudentSubmissions,
    getStudentDetails,
    updateStudent,
    deleteStudent
} from '../controllers/submissionController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createSubmission);
router.get('/practical/:practicalId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getSubmissionsByPractical);
router.get('/:submissionId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getSubmissionById);
router.put('/:submissionId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), updateSubmission);
router.get('/student/:studentId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getStudentSubmissions);
router.get('/student-details/:studentId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getStudentDetails);
router.put('/student/:studentId', authMiddleware, roleMiddleware(['HOD']), updateStudent);
router.delete('/student/:studentId', authMiddleware, roleMiddleware(['HOD']), deleteStudent);

export default router;