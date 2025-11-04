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
exports.deleteCourseFacultyAssignment = deleteCourseFacultyAssignment;
exports.getCoursesByFaculty = getCoursesByFaculty;
exports.assignCourseToFaculty = assignCourseToFaculty;
exports.updateCourseFacultyAssignment = updateCourseFacultyAssignment;
exports.getFacultyByCourse = getFacultyByCourse;
const courseFacultyService = __importStar(require("./../services/courseFacultyService"));
const errors_1 = require("./../utils/errors");
function deleteCourseFacultyAssignment(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const hodDepartmentId = req.user.department_id;
            const courseId = parseInt(req.params.courseId);
            const batchId = parseInt(req.params.batchId);
            yield courseFacultyService.deleteCourseFacultyAssignment(courseId, batchId);
            res.status(204).send();
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
function getCoursesByFaculty(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const courses = yield courseFacultyService.getCoursesByFaculty(parseInt(req.params.facultyId));
            res.json(courses);
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
function assignCourseToFaculty(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const assignment = yield courseFacultyService.assignCourseToFaculty(req.body);
            res.status(201).json(assignment);
        }
        catch (error) {
            next(error);
        }
    });
}
function updateCourseFacultyAssignment(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const courseId = parseInt(req.params.courseId);
            const batchId = parseInt(req.params.batchId);
            const { faculty_id } = req.body;
            const assignment = yield courseFacultyService.updateCourseFacultyAssignment(courseId, batchId, faculty_id);
            res.json(assignment);
        }
        catch (error) {
            next(error);
        }
    });
}
function getFacultyByCourse(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const courseId = parseInt(req.params.courseId);
            const assignments = yield courseFacultyService.getFacultyByCourse(courseId);
            res.json(assignments);
        }
        catch (error) {
            next(error);
        }
    });
}
