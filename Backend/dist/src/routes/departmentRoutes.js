"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const departmentController_1 = require("./../controllers/departmentController");
const authMiddleware_1 = require("./../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get('/', departmentController_1.getDepartments);
router.post('/', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['Admin']), departmentController_1.createDepartment);
router.put('/:id', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['Admin']), departmentController_1.updateDepartment);
router.delete('/:id', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['Admin']), departmentController_1.deleteDepartment);
router.get('/:departmentId', departmentController_1.getDepartmentById);
exports.default = router;
