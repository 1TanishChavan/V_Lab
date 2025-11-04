"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const practicalController_1 = require("./../controllers/practicalController");
const submissionController_1 = require("./../../src/controllers/submissionController");
const authMiddleware_1 = require("./../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get('/', practicalController_1.getPracticals);
router.post('/', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['HOD', 'Faculty']), practicalController_1.createPractical);
router.put('/:id', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['HOD', 'Faculty']), practicalController_1.updatePractical);
router.delete('/:id', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['HOD', 'Faculty']), practicalController_1.deletePractical);
router.get('/course/:courseId', practicalController_1.getPracticalByCourse);
router.get('/:id', practicalController_1.getPracticalById);
router.get('/:id/languages', practicalController_1.getPracticalLanguages);
router.get('/:courseId/student-view', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['Student']), submissionController_1.getPracticalWithSubmissionStatus);
exports.default = router;
