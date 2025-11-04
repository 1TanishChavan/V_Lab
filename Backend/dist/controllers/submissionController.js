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
exports.runCode = runCode;
exports.getSubmissionsByPractical = getSubmissionsByPractical;
exports.getSubmissionById = getSubmissionById;
exports.updateSubmission = updateSubmission;
exports.getStudentSubmissions = getStudentSubmissions;
exports.getStudentDetails = getStudentDetails;
exports.updateStudent = updateStudent;
exports.deleteStudent = deleteStudent;
exports.getRunResult = getRunResult;
exports.getPreviousSubmission = getPreviousSubmission;
exports.submitCode = submitCode;
exports.getSubmissionStatus = getSubmissionStatus;
exports.getPracticalWithSubmissionStatus = getPracticalWithSubmissionStatus;
const submissionService = __importStar(require("../services/submissionService"));
const errors_1 = require("../../src/utils/errors");
const schema_1 = require("../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../config/db");
function runCode(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield submissionService.runCode(req.body);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    });
}
function getSubmissionsByPractical(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { practicalId } = req.params;
            const { batchId } = req.query;
            const submissions = yield submissionService.getSubmissionsByPractical(parseInt(practicalId), parseInt(batchId), req.user.user_id);
            res.json(submissions);
        }
        catch (error) {
            next(error);
        }
    });
}
function getSubmissionById(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const submission = yield submissionService.getSubmissionById(parseInt(req.params.submissionId));
            res.json(submission);
        }
        catch (error) {
            next(error);
        }
    });
}
function updateSubmission(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { status, marks } = req.body;
            if (typeof status !== 'string' || typeof marks !== 'number') {
                throw new errors_1.AppError(400, 'Invalid input');
            }
            const updatedSubmission = yield submissionService.updateSubmission(parseInt(req.params.submissionId), { status, marks });
            res.json(updatedSubmission);
        }
        catch (error) {
            next(error);
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
function getStudentDetails(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { studentId } = req.params;
            const studentDetails = yield submissionService.getStudentDetails(parseInt(studentId));
            res.json(studentDetails);
        }
        catch (error) {
            next(error);
        }
    });
}
function updateStudent(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { studentId } = req.params;
            const updateData = req.body;
            const updatedStudent = yield submissionService.updateStudent(parseInt(studentId), updateData);
            res.json(updatedStudent);
        }
        catch (error) {
            next(error);
        }
    });
}
function deleteStudent(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { studentId } = req.params;
            yield submissionService.deleteStudent(parseInt(studentId));
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    });
}
function getRunResult(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { token } = req.params;
            const result = yield submissionService.getRunResult(token);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    });
}
function getPreviousSubmission(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { practicalId } = req.params;
            const studentId = req.user.user_id;
            const previousSubmission = yield db_1.db
                .select({
                submission_id: schema_1.submissions.submission_id,
                code: schema_1.submissions.code_submitted,
                status: schema_1.submissions.status,
                submission_time: schema_1.submissions.submission_time,
                marks: schema_1.submissions.marks
            })
                .from(schema_1.submissions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.submissions.practical_id, parseInt(practicalId)), (0, drizzle_orm_1.eq)(schema_1.submissions.student_id, studentId)))
                .orderBy(schema_1.submissions.submission_time, 'desc')
                .limit(1);
            if (previousSubmission.length === 0) {
                return res.status(200).json({
                    message: 'No previous submission found'
                });
            }
            res.json(previousSubmission[0]);
        }
        catch (error) {
            next(error);
        }
    });
}
function submitCode(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { practicalId, code, language, submissionId } = req.body;
            const studentId = req.user.user_id;
            if (!practicalId || !code || !language) {
                throw new errors_1.AppError(400, 'Missing required fields');
            }
            const existingSubmission = yield db_1.db
                .select()
                .from(schema_1.submissions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.submissions.practical_id, practicalId), (0, drizzle_orm_1.eq)(schema_1.submissions.student_id, studentId), (0, drizzle_orm_1.eq)(schema_1.submissions.status, 'Accepted')))
                .limit(1);
            if (existingSubmission.length > 0) {
                return res.status(200).json({
                    alreadySubmitted: true,
                    message: 'You have already submitted this practical successfully.',
                    status: "Accepted"
                });
            }
            if (submissionId && submissionId !== -1) {
                const result = yield submissionService.updateSubmissionCode({
                    submissionId,
                    code,
                    language,
                    practicalId,
                    studentId
                });
                console.log("asd");
                return res.status(200).json(result);
            }
            const result = yield submissionService.submitCode({
                practicalId,
                studentId,
                code,
                language
            });
            console.log("dsa");
            res.status(201).json(result);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                next(error);
            }
        }
    });
}
function getSubmissionStatus(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { submissionId } = req.params;
            const status = yield submissionService.getSubmissionStatus(submissionId);
            res.json({
                completed: status.completed,
                status: status.status,
            });
        }
        catch (error) {
            next(error);
        }
    });
}
function getPracticalWithSubmissionStatus(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const courseId = parseInt(req.params.courseId);
        const studentId = req.user.user_id;
        try {
            const result = yield db_1.db
                .select({
                practical_id: schema_1.practicals.practical_id,
                sr_no: schema_1.practicals.sr_no,
                practical_name: schema_1.practicals.practical_name,
                course_id: schema_1.practicals.course_id,
                description: schema_1.practicals.description,
                pdf_url: schema_1.practicals.pdf_url,
                status: schema_1.submissions.status,
                marks: schema_1.submissions.marks,
                deadline: schema_1.batch_practical_access.deadline,
                lock: schema_1.batch_practical_access.lock,
            })
                .from(schema_1.practicals)
                .leftJoin(schema_1.submissions, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.submissions.practical_id, schema_1.practicals.practical_id), (0, drizzle_orm_1.eq)(schema_1.submissions.student_id, studentId)))
                .leftJoin(schema_1.batch_practical_access, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.batch_practical_access.practical_id, schema_1.practicals.practical_id), (0, drizzle_orm_1.eq)(schema_1.batch_practical_access.batch_id, req.user.batch_id)))
                .where((0, drizzle_orm_1.eq)(schema_1.practicals.course_id, courseId))
                .having((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.batch_practical_access.lock, false), (0, drizzle_orm_1.isNotNull)(schema_1.submissions.status)))
                .orderBy(schema_1.practicals.sr_no);
            res.json(result);
        }
        catch (error) {
            console.error('Error in getPracticalWithSubmissionStatus:', error);
            res.status(500).json({
                error: 'Failed to fetch practicals',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
}
