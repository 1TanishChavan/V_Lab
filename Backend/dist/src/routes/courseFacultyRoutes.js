"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseFacultyController_1 = require("./../controllers/courseFacultyController");
const authMiddleware_1 = require("./../middlewares/authMiddleware");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['HOD']), courseFacultyController_1.assignCourseToFaculty);
router.put('/:courseId/:batchId', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['HOD']), courseFacultyController_1.updateCourseFacultyAssignment);
router.delete('/:courseId/:batchId', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['HOD']), courseFacultyController_1.deleteCourseFacultyAssignment);
router.get('/:courseId', courseFacultyController_1.getFacultyByCourse);
router.get('/faculty/:facultyId/courses', courseFacultyController_1.getCoursesByFaculty);
exports.default = router;
