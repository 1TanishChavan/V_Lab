"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const batchController_1 = require("../controllers/batchController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get('/', batchController_1.getBatches);
router.post('/', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['HOD', 'Faculty', 'Admin']), batchController_1.createBatch);
router.put('/:id', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['HOD', 'Faculty', 'Admin']), batchController_1.updateBatch);
router.delete('/:id', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['HOD', 'Faculty', 'Admin']), batchController_1.deleteBatch);
router.post('/batches', authMiddleware_1.authMiddleware, batchController_1.createBatch);
router.get('/batches', authMiddleware_1.authMiddleware, batchController_1.getBatches);
router.get('/department/:departmentId/semester/:semester', batchController_1.getBatchesByDepartmentAndSemester);
exports.default = router;
