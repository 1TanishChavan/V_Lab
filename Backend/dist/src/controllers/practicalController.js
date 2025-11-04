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
exports.createPractical = createPractical;
exports.deletePractical = deletePractical;
exports.getPracticals = getPracticals;
exports.getPracticalByCourse = getPracticalByCourse;
exports.getPracticalById = getPracticalById;
exports.getPracticalLanguages = getPracticalLanguages;
exports.updatePractical = updatePractical;
const practicalService = __importStar(require("../services/practicalService"));
const errors_1 = require("../utils/errors");
function createPractical(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(req.body);
            const practical = yield practicalService.createPractical(req.body);
            res.status(201).json(practical);
        }
        catch (error) {
            next(error);
        }
    });
}
function deletePractical(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield practicalService.deletePractical(parseInt(req.params.id));
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    });
}
function getPracticals(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const practicals = yield practicalService.getPracticals();
            res.json(practicals);
        }
        catch (error) {
            next(error);
        }
    });
}
function getPracticalByCourse(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const practicals = yield practicalService.getPracticalByCourse(parseInt(req.params.courseId));
            res.json(practicals);
        }
        catch (error) {
            next(error);
        }
    });
}
function getPracticalById(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const practical = yield practicalService.getPracticalById(parseInt(req.params.id));
            if (!practical) {
                throw new errors_1.AppError(404, 'Practical not found');
            }
            res.json(practical);
        }
        catch (error) {
            next(error);
        }
    });
}
function getPracticalLanguages(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const practicalId = parseInt(req.params.id);
            if (isNaN(practicalId)) {
                throw new errors_1.AppError(400, 'Invalid practical ID');
            }
            const languages = yield practicalService.getPracticalLanguages(practicalId);
            if (!languages) {
                throw new errors_1.AppError(404, 'No languages found for the specified practical');
            }
            res.json(languages);
        }
        catch (error) {
            next(error);
        }
    });
}
function validatePracticalData(data) {
    const errors = [];
    if (!data.sr_no || isNaN(Number(data.sr_no))) {
        errors.push('Valid sr_no is required');
    }
    if (!data.practical_name || typeof data.practical_name !== 'string') {
        errors.push('Practical name is required');
    }
    if (!data.description || typeof data.description !== 'string') {
        errors.push('Description is required');
    }
    if (!data.course_id || isNaN(Number(data.course_id))) {
        errors.push('Valid course_id is required');
    }
    if (!Array.isArray(data.prac_io)) {
        errors.push('Test cases must be an array');
    }
    else {
        data.prac_io.forEach((io, index) => {
            if (typeof io.input !== 'string') {
                errors.push(`Test case ${index + 1}: Input must be a string`);
            }
            if (typeof io.output !== 'string') {
                errors.push(`Test case ${index + 1}: Output must be a string`);
            }
            if (typeof io.isPublic !== 'boolean') {
                errors.push(`Test case ${index + 1}: isPublic must be a boolean`);
            }
        });
    }
    if (!Array.isArray(data.prac_language)) {
        errors.push('Programming languages must be an array');
    }
    else {
        data.prac_language.forEach((lang, index) => {
            if (!lang.programming_language_id || isNaN(Number(lang.programming_language_id))) {
                errors.push(`Programming language ${index + 1}: Valid programming_language_id is required`);
            }
        });
    }
    if (errors.length > 0) {
        throw new errors_1.AppError(400, `Validation failed: ${errors.join(', ')}`);
    }
    return Object.assign(Object.assign({}, data), { sr_no: Number(data.sr_no), course_id: Number(data.course_id), prac_language: data.prac_language.map(lang => ({
            programming_language_id: Number(lang.programming_language_id)
        })) });
}
function updatePractical(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const practicalId = parseInt(req.params.id);
            if (isNaN(practicalId)) {
                throw new errors_1.AppError(400, 'Invalid practical ID');
            }
            const validatedData = validatePracticalData(req.body);
            const existingPractical = yield practicalService.getPracticalById(practicalId);
            if (!existingPractical) {
                throw new errors_1.AppError(404, 'Practical not found');
            }
            if (req.user.role === 'Faculty') {
                const hasPermission = yield practicalService.checkFacultyPracticalPermission(req.user.user_id, existingPractical.course_id);
                if (!hasPermission) {
                    throw new errors_1.AppError(403, 'You do not have permission to update this practical');
                }
            }
            const updatedPractical = yield practicalService.updatePractical(practicalId, validatedData);
            res.json({
                status: 'success',
                data: updatedPractical
            });
        }
        catch (error) {
            next(error);
        }
    });
}
