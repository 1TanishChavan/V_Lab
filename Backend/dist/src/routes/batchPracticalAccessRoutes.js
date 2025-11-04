"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const batchPracticalAccessController_1 = require("../controllers/batchPracticalAccessController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get('/:practicalId/:courseId/:facultyId', batchPracticalAccessController_1.getBatchPracticalAccess);
router.get('/:practicalId', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['Faculty', 'HOD']), batchPracticalAccessController_1.getBatchPracticalAccess);
router.get('/:practicalId/:facultyId', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['Faculty', 'HOD']), batchPracticalAccessController_1.getBatchPracticalAccess);
router.post('/', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['Faculty', 'HOD']), batchPracticalAccessController_1.createOrUpdateBatchPracticalAccess);
exports.default = router;
