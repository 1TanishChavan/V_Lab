"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBatchPracticalAccess = void 0;
exports.createOrUpdateBatchPracticalAccess = createOrUpdateBatchPracticalAccess;
const batchPracticalAccessService = __importStar(require("./../../src/services/batchPracticalAccessService"));
const getBatchPracticalAccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const practicalId = parseInt(req.params.practicalId);
        const courseId = parseInt(req.params.courseId);
        const facultyId = parseInt(req.params.facultyId);
        if (isNaN(practicalId) || isNaN(courseId) || isNaN(facultyId)) {
            return res.status(400).json({ message: 'Invalid parameters' });
        }
        const batchAccess = yield batchPracticalAccessService.getBatchPracticalAccess(practicalId, courseId, facultyId);
        res.json(batchAccess);
    }
    catch (error) {
        console.error('Error in getBatchPracticalAccess:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getBatchPracticalAccess = getBatchPracticalAccess;
function createOrUpdateBatchPracticalAccess(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { practical_id, batch_id, lock, deadline } = req.body;
            const result = yield batchPracticalAccessService.createOrUpdateBatchPracticalAccess({
                practical_id,
                batch_id,
                lock,
                deadline: new Date(deadline),
            });
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    });
}
