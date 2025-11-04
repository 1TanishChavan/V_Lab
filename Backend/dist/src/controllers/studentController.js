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
exports.getStudentsByDepartment = getStudentsByDepartment;
exports.getStudentsByBatch = getStudentsByBatch;
exports.getStudentSubmissions = getStudentSubmissions;
exports.getStudentByRollId = getStudentByRollId;
exports.getStudentsByDepartmentAndSemester = getStudentsByDepartmentAndSemester;
exports.getStudentsWithFilters = getStudentsWithFilters;
exports.getDepartments = getDepartments;
exports.getSemesters = getSemesters;
exports.getDivisions = getDivisions;
exports.getBatches = getBatches;
const studentService = __importStar(require("./../services/studentService"));
const submissionService = __importStar(require("./../services/submissionService"));
const errors_1 = require("./../../src/utils/errors");
function getStudentsByDepartment(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const departmentId = req.params.department;
            const students = yield studentService.getStudentsByDepartment(departmentId);
            res.json(students);
        }
        catch (error) {
            next(error);
        }
    });
}
function getStudentsByBatch(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const students = yield studentService.getStudentsByBatch(parseInt(req.params.batchId));
            res.json(students);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
            }
            else {
                next(error);
            }
        }
    });
}
function getStudentSubmissions(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { studentId } = req.params;
            const submissions = yield submissionService.getStudentSubmissions(parseInt(studentId));
            res.json(submissions);
        }
        catch (error) {
            next(error);
        }
    });
}
function getStudentByRollId(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const student = yield studentService.getStudentByRollId(req.params.rollId);
            res.json(student);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
            }
            else {
                next(error);
            }
        }
    });
}
function getStudentsByDepartmentAndSemester(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const students = yield studentService.getStudentsByDepartmentAndSemester(parseInt(req.params.departmentId), parseInt(req.params.semester));
            res.json(students);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
            }
            else {
                next(error);
            }
        }
    });
}
function getStudentsWithFilters(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { department, semester, division, batch } = req.query;
            const students = yield studentService.getStudentsWithFilters({
                department: department,
                semester: semester,
                division: division,
                batch: batch,
            });
            res.json(students);
        }
        catch (error) {
            next(error instanceof errors_1.AppError ? res.status(error.statusCode).json({ error: error.message }) : next(error));
        }
    });
}
function getDepartments(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const departments = yield studentService.getDepartments();
            res.json(departments);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
            }
            else {
                next(error);
            }
        }
    });
}
function getSemesters(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const semesters = yield studentService.getSemesters();
            res.json(semesters);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
            }
            else {
                next(error);
            }
        }
    });
}
function getDivisions(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const divisions = yield studentService.getDivisions();
            res.json(divisions);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
            }
            else {
                next(error);
            }
        }
    });
}
function getBatches(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const batches = yield studentService.getBatchesByDepartmentAndSemester(parseInt(req.params.depID), parseInt(req.params.sem));
            res.json(batches);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                res.status(error.statusCode).json({ error: error.message });
            }
            else {
                next(error);
            }
        }
    });
}
