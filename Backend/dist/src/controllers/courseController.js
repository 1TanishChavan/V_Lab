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
exports.getCourses = getCourses;
exports.createCourse = createCourse;
exports.updateCourse = updateCourse;
exports.deleteCourse = deleteCourse;
exports.getCoursesBySemesterAndDepartment = getCoursesBySemesterAndDepartment;
exports.getCoursesByDepartment = getCoursesByDepartment;
exports.getCoursesById = getCoursesById;
const courseService = __importStar(require("../services/courseService"));
function getCourses(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const courses = yield courseService.getAllCourses();
            res.json(courses);
        }
        catch (error) {
            next(error);
        }
    });
}
function createCourse(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newCourse = yield courseService.createCourse(req.body);
            res.status(201).json(newCourse);
        }
        catch (error) {
            next(error);
        }
    });
}
function updateCourse(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updatedCourse = yield courseService.updateCourse(parseInt(req.params.id), req.body);
            res.json(updatedCourse);
        }
        catch (error) {
            next(error);
        }
    });
}
function deleteCourse(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield courseService.deleteCourse(parseInt(req.params.id));
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    });
}
function getCoursesBySemesterAndDepartment(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { semester, departmentId } = req.params;
            const courses = yield courseService.getCoursesBySemesterAndDepartment(parseInt(semester), parseInt(departmentId));
            res.json(courses);
        }
        catch (error) {
            next(error);
        }
    });
}
function getCoursesByDepartment(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { departmentId } = req.params;
            const courses = yield courseService.getCoursesByDepartment(parseInt(departmentId));
            res.json(courses);
        }
        catch (error) {
            next(error);
        }
    });
}
function getCoursesById(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { courseId } = req.params;
            const courses = yield courseService.getCoursesById(parseInt(courseId));
            res.json(courses);
        }
        catch (error) {
            next(error);
        }
    });
}
