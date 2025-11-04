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
exports.getDepartments = getDepartments;
exports.createDepartment = createDepartment;
exports.updateDepartment = updateDepartment;
exports.deleteDepartment = deleteDepartment;
exports.getDepartmentById = getDepartmentById;
const departmentService = __importStar(require("../services/departmentService"));
const errors_1 = require("../../src/utils/errors");
function getDepartments(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const departments = yield departmentService.getAllDepartments();
            res.json(departments);
        }
        catch (error) {
            next(error);
        }
    });
}
function createDepartment(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { name } = req.body;
            console.log("dname", name);
            if (!name) {
                throw new errors_1.AppError(400, 'Department name is required');
            }
            const newDepartment = yield departmentService.createDepartment({ name });
            console.log("new", newDepartment);
            res.status(201).json(newDepartment);
        }
        catch (error) {
            next(error);
        }
    });
}
function updateDepartment(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { name } = req.body;
            const updatedDepartment = yield departmentService.updateDepartment(parseInt(req.params.id), { name });
            res.json(updatedDepartment);
        }
        catch (error) {
            next(error);
        }
    });
}
function deleteDepartment(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield departmentService.deleteDepartment(parseInt(req.params.id));
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    });
}
function getDepartmentById(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { departmentId } = req.params;
            const department = yield departmentService.getDepartmentById(parseInt(departmentId));
            res.json(department);
        }
        catch (error) {
            next(error);
        }
    });
}
