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
exports.addFaculty = addFaculty;
exports.getFacultyByDepartment_omkar = getFacultyByDepartment_omkar;
exports.getFacultyByDepartment_tanish = getFacultyByDepartment_tanish;
exports.getAllFaculty = getAllFaculty;
exports.getFacultyBatches = getFacultyBatches;
exports.deleteFaculty = deleteFaculty;
exports.getFacultyDetails = getFacultyDetails;
const facultyService = __importStar(require("../services/facultyService"));
const errors_1 = require("../utils/errors");
function addFaculty(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { username, email, password, department_id, role } = req.body;
            const newFaculty = yield facultyService.createFaculty({ username, email, password, department_id, role });
            res.status(201).json(newFaculty);
        }
        catch (error) {
            console.error('Error in addFaculty:', error);
            next(new errors_1.AppError(500, 'Failed to create faculty'));
        }
    });
}
function getFacultyByDepartment_omkar(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const departmentId = parseInt(req.params.departmentId, 10);
            const faculty = yield facultyService.getFacultyByDepartment_omkar(departmentId);
            res.json(faculty);
        }
        catch (error) {
            console.error('Error fetching faculty by department:', error);
            next(error);
        }
    });
}
function getFacultyByDepartment_tanish(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const departmentId = parseInt(req.params.departmentId);
            const faculty = yield facultyService.getFacultyByDepartment_tanish(departmentId);
            res.json(faculty);
        }
        catch (error) {
            next(error);
        }
    });
}
function getAllFaculty(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const faculty = yield facultyService.getAllFaculty();
            res.json(faculty);
        }
        catch (error) {
            console.error('Error fetching all faculty:', error);
            next(error);
        }
    });
}
function getFacultyBatches(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const facultyId = parseInt(req.params.facultyId, 10);
            const batches = yield facultyService.getFacultyBatches(facultyId);
            res.json(batches);
        }
        catch (error) {
            next(error);
        }
    });
}
function deleteFaculty(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const facultyId = parseInt(req.params.facultyId, 10);
            yield facultyService.deleteFaculty(facultyId);
            res.status(200).json({ message: 'Faculty deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting faculty:', error);
            next(new errors_1.AppError(500, 'Failed to delete faculty'));
        }
    });
}
function getFacultyDetails(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const facultyId = parseInt(req.params.facultyId);
            const facultyDetails = yield facultyService.getFacultyDetails(facultyId);
            res.json(facultyDetails);
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
