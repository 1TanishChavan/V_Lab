import express from 'express';
import {
    getSubmissionsByPractical,
    getSubmissionById,
    updateSubmission,
    getStudentSubmissions,
    getStudentDetails,
    updateStudent,
    deleteStudent, getPreviousSubmission,
    submitCode, runCode, getRunResult, getSubmissionStatus
} from './../controllers/submissionController';
import { authMiddleware, roleMiddleware } from './../middlewares/authMiddleware';
import { createRateLimiter } from './../middlewares/createRateLimiter';

const router = express.Router();

// Reduced to 10 seconds (single digit logic applied where reasonable, or kept low double digit for submissions)
router.post('/submit-code', authMiddleware, createRateLimiter({
    windowMs: 10 * 1000,
    max: 5,
    keyPrefix: 'submit'
}), submitCode);

router.get('/practical/:practicalId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getSubmissionsByPractical);
router.get('/:submissionId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getSubmissionById);
router.put('/:submissionId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), updateSubmission);

router.put('/student/:studentId', authMiddleware, roleMiddleware(['HOD']), updateStudent);
router.delete('/student/:studentId', authMiddleware, roleMiddleware(['HOD']), deleteStudent);

// CHANGED: Reduced windowMs to 5 seconds (Single digit)
router.post('/run', authMiddleware, createRateLimiter({
    windowMs: 5 * 1000,
    max: 5
}), runCode);

router.get('/run/:token', authMiddleware, getRunResult);
router.get('/:submissionId/status', authMiddleware, getSubmissionStatus);

router.get('/previous/:practicalId', authMiddleware, getPreviousSubmission);

router.get('/student/:studentId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getStudentSubmissions);
router.get('/student-details/:studentId', authMiddleware, roleMiddleware(['Faculty', 'HOD']), getStudentDetails);


export default router;