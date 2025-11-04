"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseController_1 = require("../controllers/courseController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get('/', courseController_1.getCourses);
router.post('/', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['HOD']), courseController_1.createCourse);
router.put('/:id', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['HOD']), courseController_1.updateCourse);
router.delete('/:id', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['HOD']), courseController_1.deleteCourse);
router.get('/:courseId', courseController_1.getCoursesById);
router.get('/department/:departmentId', courseController_1.getCoursesByDepartment);
router.get('/semester/:semester/department/:departmentId', courseController_1.getCoursesBySemesterAndDepartment);
exports.default = router;
