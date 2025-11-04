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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateStudentWithBatchSelect = exports.validatePracticalWithDetailsSelect = exports.validateCourseWithFacultySelect = exports.validateReportSelect = exports.validateReportUpdate = exports.validateReportInsert = exports.validateSubmissionSelect = exports.validateSubmissionUpdate = exports.validateSubmissionInsert = exports.validateCourseFacultySelect = exports.validateCourseFacultyUpdate = exports.validateCourseFacultyInsert = exports.validateProgrammingLanguageSelect = exports.validateProgrammingLanguageUpdate = exports.validateProgrammingLanguageInsert = exports.validateFacultySelect = exports.validateFacultyUpdate = exports.validateFacultyInsert = exports.validateStudentSelect = exports.validateStudentUpdate = exports.validateStudentInsert = exports.validateBatchPracticalAccessSelect = exports.validateBatchPracticalAccessUpdate = exports.validateBatchPracticalAccessInsert = exports.validatePracticalSelect = exports.validatePracticalUpdate = exports.validatePracticalInsert = exports.validateCourseSelect = exports.validateCourseUpdate = exports.validateCourseInsert = exports.validateBatchSelect = exports.validateBatchUpdate = exports.validateBatchInsert = exports.validateDepartmentSelect = exports.validateDepartmentUpdate = exports.validateDepartmentInsert = exports.validateUserSelect = exports.validateUserUpdate = exports.validateUserInsert = void 0;
exports.validateRequestBody = validateRequestBody;
exports.validateResponseData = validateResponseData;
const compiler_1 = require("@sinclair/typebox/compiler");
const schemas = __importStar(require("../../src/schemas"));
function validateRequestBody(schema) {
    const check = compiler_1.TypeCompiler.Compile(schema);
    return (req, res, next) => {
        const { body } = req;
        if (check.Check(body)) {
            next();
        }
        else {
            res.status(400).json({ error: 'Invalid request body', details: check.Errors(body) });
        }
    };
}
function validateResponseData(schema) {
    const check = compiler_1.TypeCompiler.Compile(schema);
    return (req, res, next) => {
        const originalJson = res.json;
        res.json = function (data) {
            if (check.Check(data)) {
                return originalJson.call(this, data);
            }
            else {
                console.error('Invalid response data', data, check.Errors(data));
                return res.status(500).json({ error: 'Internal server error' });
            }
        };
        next();
    };
}
exports.validateUserInsert = validateRequestBody(schemas.insertUserSchema);
exports.validateUserUpdate = validateRequestBody(schemas.updateUserSchema);
exports.validateUserSelect = validateResponseData(schemas.selectUserSchema);
exports.validateDepartmentInsert = validateRequestBody(schemas.insertDepartmentSchema);
exports.validateDepartmentUpdate = validateRequestBody(schemas.updateDepartmentSchema);
exports.validateDepartmentSelect = validateResponseData(schemas.selectDepartmentSchema);
exports.validateBatchInsert = validateRequestBody(schemas.insertBatchSchema);
exports.validateBatchUpdate = validateRequestBody(schemas.updateBatchSchema);
exports.validateBatchSelect = validateResponseData(schemas.selectBatchSchema);
exports.validateCourseInsert = validateRequestBody(schemas.insertCourseSchema);
exports.validateCourseUpdate = validateRequestBody(schemas.updateCourseSchema);
exports.validateCourseSelect = validateResponseData(schemas.selectCourseSchema);
exports.validatePracticalInsert = validateRequestBody(schemas.insertPracticalSchema);
exports.validatePracticalUpdate = validateRequestBody(schemas.updatePracticalSchema);
exports.validatePracticalSelect = validateResponseData(schemas.selectPracticalSchema);
exports.validateBatchPracticalAccessInsert = validateRequestBody(schemas.insertBatchPracticalAccessSchema);
exports.validateBatchPracticalAccessUpdate = validateRequestBody(schemas.updateBatchPracticalAccessSchema);
exports.validateBatchPracticalAccessSelect = validateResponseData(schemas.selectBatchPracticalAccessSchema);
exports.validateStudentInsert = validateRequestBody(schemas.insertStudentSchema);
exports.validateStudentUpdate = validateRequestBody(schemas.updateStudentSchema);
exports.validateStudentSelect = validateResponseData(schemas.selectStudentSchema);
exports.validateFacultyInsert = validateRequestBody(schemas.insertFacultySchema);
exports.validateFacultyUpdate = validateRequestBody(schemas.updateFacultySchema);
exports.validateFacultySelect = validateResponseData(schemas.selectFacultySchema);
exports.validateProgrammingLanguageInsert = validateRequestBody(schemas.insertProgrammingLanguageSchema);
exports.validateProgrammingLanguageUpdate = validateRequestBody(schemas.updateProgrammingLanguageSchema);
exports.validateProgrammingLanguageSelect = validateResponseData(schemas.selectProgrammingLanguageSchema);
exports.validateCourseFacultyInsert = validateRequestBody(schemas.insertCourseFacultySchema);
exports.validateCourseFacultyUpdate = validateRequestBody(schemas.updateCourseFacultySchema);
exports.validateCourseFacultySelect = validateResponseData(schemas.selectCourseFacultySchema);
exports.validateSubmissionInsert = validateRequestBody(schemas.insertSubmissionSchema);
exports.validateSubmissionUpdate = validateRequestBody(schemas.updateSubmissionSchema);
exports.validateSubmissionSelect = validateResponseData(schemas.selectSubmissionSchema);
exports.validateReportInsert = validateRequestBody(schemas.insertReportSchema);
exports.validateReportUpdate = validateRequestBody(schemas.updateReportSchema);
exports.validateReportSelect = validateResponseData(schemas.selectReportSchema);
exports.validateCourseWithFacultySelect = validateResponseData(schemas.selectCourseWithFacultySchema);
exports.validatePracticalWithDetailsSelect = validateResponseData(schemas.selectPracticalWithDetailsSchema);
exports.validateStudentWithBatchSelect = validateResponseData(schemas.selectStudentWithBatchSchema);
