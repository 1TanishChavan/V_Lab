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
exports.getBatches = getBatches;
exports.createBatch = createBatch;
exports.updateBatch = updateBatch;
exports.deleteBatch = deleteBatch;
exports.getBatchesByDepartmentAndSemester = getBatchesByDepartmentAndSemester;
const batchService = __importStar(require("./../services/batchService"));
function getBatches(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { department_id, semester } = req.query;
        try {
            const batches = yield batchService.getBatchesByDepartmentAndSemester(parseInt(department_id), parseInt(semester));
            res.status(200).json(batches);
        }
        catch (error) {
            console.error("Error fetching batches:", error);
            res.status(500).json({ error: "Failed to fetch batches" });
        }
    });
}
function createBatch(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newBatch = yield batchService.createBatch(req.body);
            res.status(201).json(newBatch);
        }
        catch (error) {
            next(error);
        }
    });
}
function updateBatch(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updatedBatch = yield batchService.updateBatch(parseInt(req.params.id), req.body);
            res.json(updatedBatch);
        }
        catch (error) {
            next(error);
        }
    });
}
function deleteBatch(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield batchService.deleteBatch(parseInt(req.params.id));
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    });
}
function getBatchesByDepartmentAndSemester(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { departmentId, semester } = req.params;
            const batches = yield batchService.getBatchesByDepartmentAndSemester(parseInt(departmentId), parseInt(semester));
            res.json(batches);
        }
        catch (error) {
            next(error);
        }
    });
}
