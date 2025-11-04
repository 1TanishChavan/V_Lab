"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const submissionController_1 = require("../controllers/submissionController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const createRateLimiter_1 = require("../middlewares/createRateLimiter");
const router = express_1.default.Router();
router.post('/submit-code', authMiddleware_1.authMiddleware, (0, createRateLimiter_1.createRateLimiter)({
    windowMs: 3 * 1000,
    max: 1,
    keyPrefix: 'submit'
}), submissionController_1.submitCode);
router.get('/practical/:practicalId', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['Faculty', 'HOD']), submissionController_1.getSubmissionsByPractical);
router.get('/:submissionId', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['Faculty', 'HOD']), submissionController_1.getSubmissionById);
router.put('/:submissionId', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['Faculty', 'HOD']), submissionController_1.updateSubmission);
router.put('/student/:studentId', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['HOD']), submissionController_1.updateStudent);
router.delete('/student/:studentId', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['HOD']), submissionController_1.deleteStudent);
router.post('/run', authMiddleware_1.authMiddleware, (0, createRateLimiter_1.createRateLimiter)({
    windowMs: 15 * 1000,
    max: 1
}), submissionController_1.runCode);
router.get('/run/:token', authMiddleware_1.authMiddleware, submissionController_1.getRunResult);
router.get('/:submissionId/status', authMiddleware_1.authMiddleware, submissionController_1.getSubmissionStatus);
router.get('/previous/:practicalId', authMiddleware_1.authMiddleware, submissionController_1.getPreviousSubmission);
router.get('/student/:studentId', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['Faculty', 'HOD']), submissionController_1.getStudentSubmissions);
router.get('/student-details/:studentId', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['Faculty', 'HOD']), submissionController_1.getStudentDetails);
exports.default = router;
