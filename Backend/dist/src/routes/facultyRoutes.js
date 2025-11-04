"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const facultyController_1 = require("./../controllers/facultyController");
const authMiddleware_1 = require("./../middlewares/authMiddleware");
const router = express_1.default.Router();
router.post('/', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['Admin', 'HOD']), facultyController_1.addFaculty);
router.get('/batches', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['Faculty', 'HOD']), facultyController_1.getFacultyBatches);
router.get('/:facultyId', authMiddleware_1.authMiddleware, facultyController_1.getFacultyDetails);
router.get('/department/:departmentId', authMiddleware_1.authMiddleware, facultyController_1.getFacultyByDepartment_omkar);
router.get('/department2/:departmentId', authMiddleware_1.authMiddleware, facultyController_1.getFacultyByDepartment_tanish);
router.get('/batches/:facultyId', authMiddleware_1.authMiddleware, facultyController_1.getFacultyBatches);
router.delete('/:facultyId', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['Admin', 'HOD']), facultyController_1.deleteFaculty);
router.get('/all', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['Admin', 'HOD']), facultyController_1.getAllFaculty);
exports.default = router;
