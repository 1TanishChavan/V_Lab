"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const programmingLanguageController_1 = require("../controllers/programmingLanguageController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get('/', programmingLanguageController_1.getProgrammingLanguages);
router.post('/', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['Admin']), programmingLanguageController_1.createProgrammingLanguage);
router.put('/:id', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['Admin']), programmingLanguageController_1.updateProgrammingLanguage);
router.delete('/:id', authMiddleware_1.authMiddleware, (0, authMiddleware_1.roleMiddleware)(['Admin']), programmingLanguageController_1.deleteProgrammingLanguage);
exports.default = router;
