"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubmissionResults = getSubmissionResults;
exports.getPracticalWithSubmissionStatus = getPracticalWithSubmissionStatus;
exports.getSubmissionsByPractical = getSubmissionsByPractical;
exports.getSubmissionById = getSubmissionById;
exports.updateSubmission = updateSubmission;
exports.getFacultyBatches = getFacultyBatches;
exports.getStudentSubmissions = getStudentSubmissions;
exports.getStudentDetails = getStudentDetails;
exports.updateStudent = updateStudent;
exports.deleteStudent = deleteStudent;
exports.getRunResult = getRunResult;
exports.getSubmissionStatus_ = getSubmissionStatus_;
exports.runCode = runCode;
exports.submitCode = submitCode;
exports.getSubmissionStatus = getSubmissionStatus;
exports.updateSubmissionCode = updateSubmissionCode;
const db_1 = require("../config/db");
const schema_1 = require("../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const errors_1 = require("../utils/errors");
const axios_1 = __importDefault(require("axios"));
const redis_1 = __importDefault(require("../config/redis"));
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'http://localhost:2358';
const SUBMISSION_TIMEOUT = 30000;
const RESULTS_EXPIRY = 3600;
const SUBMISSION_RATE_LIMIT = 3;
const RUN_RATE_LIMIT = 1;
const SUBMISSION_BATCH_SIZE = 5;
const BATCH_SIZE = 5;
const MAX_POLL_ATTEMPTS = 6;
const POLL_INTERVAL = 5000;
function getSubmissionResults(submissionId) {
    return __awaiter(this, void 0, void 0, function* () {
        const redisKey = `submission:${submissionId}`;
        const submissionData = yield redis_1.default.get(redisKey);
        if (!submissionData) {
            throw new errors_1.AppError(404, 'Submission not found');
        }
        const data = JSON.parse(submissionData);
        return {
            status: data.status,
            testResults: data.results,
            allPassed: data.status === 'completed' &&
                data.results.every((result) => result.status === 'Accepted')
        };
    });
}
function getPracticalWithSubmissionStatus(courseId, studentId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield db_1.db.select({
            practical_id: schema_1.practicals.practical_id,
            sr_no: schema_1.practicals.sr_no,
            practical_name: schema_1.practicals.practical_name,
            description: schema_1.practicals.description,
            pdf_url: schema_1.practicals.pdf_url,
            status: schema_1.submissions.status,
            marks: schema_1.submissions.marks,
            deadline: schema_1.batch_practical_access.deadline,
            lock: schema_1.batch_practical_access.lock,
        })
            .from(schema_1.practicals)
            .leftJoin(schema_1.submissions, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.submissions.practical_id, schema_1.practicals.practical_id), (0, drizzle_orm_1.eq)(schema_1.submissions.student_id, studentId)))
            .leftJoin(schema_1.batch_practical_access, (0, drizzle_orm_1.eq)(schema_1.batch_practical_access.practical_id, schema_1.practicals.practical_id))
            .leftJoin(schema_1.students, (0, drizzle_orm_1.eq)(schema_1.students.student_id, studentId))
            .leftJoin(schema_1.batch, (0, drizzle_orm_1.eq)(schema_1.batch.batch_id, schema_1.students.batch_id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.practicals.course_id, courseId), (0, drizzle_orm_1.eq)(schema_1.batch_practical_access.batch_id, schema_1.batch.batch_id)));
        return result;
    });
}
function getSubmissionsByPractical(practicalId, batchId, facultyId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const submissionsList = yield db_1.db
                .select({
                submission_id: schema_1.submissions.submission_id,
                roll_id: schema_1.students.roll_id,
                student_name: schema_1.users.username,
                code: schema_1.submissions.code_submitted,
                status: schema_1.submissions.status,
                submission_time: schema_1.submissions.submission_time,
                marks: schema_1.submissions.marks,
                batch: schema_1.students.batch_id
            })
                .from(schema_1.submissions)
                .innerJoin(schema_1.students, (0, drizzle_orm_1.eq)(schema_1.submissions.student_id, schema_1.students.student_id))
                .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.students.student_id, schema_1.users.user_id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.submissions.practical_id, practicalId), (0, drizzle_orm_1.eq)(schema_1.students.batch_id, batchId)));
            return submissionsList;
        }
        catch (error) {
            console.error('Error in getSubmissionsByPractical:', error);
            throw new errors_1.AppError(500, 'Failed to fetch submissions for practical');
        }
    });
}
function getSubmissionById(submissionId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const submission = yield db_1.db
                .select({
                submission_id: schema_1.submissions.submission_id,
                practical_sr_no: schema_1.practicals.sr_no,
                practical_name: schema_1.practicals.practical_name,
                course_name: schema_1.courses.course_name,
                prac_io: schema_1.prac_io.input,
                submission_status: schema_1.submissions.status,
                code_submitted: schema_1.submissions.code_submitted,
                marks: schema_1.submissions.marks,
                student_name: schema_1.users.username,
                roll_id: schema_1.students.roll_id,
                submission_time: schema_1.submissions.submission_time,
                batch_name: schema_1.batch.batch
            })
                .from(schema_1.submissions)
                .innerJoin(schema_1.practicals, (0, drizzle_orm_1.eq)(schema_1.submissions.practical_id, schema_1.practicals.practical_id))
                .innerJoin(schema_1.prac_io, (0, drizzle_orm_1.eq)(schema_1.practicals.practical_id, schema_1.prac_io.practical_id))
                .innerJoin(schema_1.courses, (0, drizzle_orm_1.eq)(schema_1.practicals.course_id, schema_1.courses.course_id))
                .innerJoin(schema_1.students, (0, drizzle_orm_1.eq)(schema_1.submissions.student_id, schema_1.students.student_id))
                .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.students.student_id, schema_1.users.user_id))
                .innerJoin(schema_1.batch, (0, drizzle_orm_1.eq)(schema_1.students.batch_id, schema_1.batch.batch_id))
                .where((0, drizzle_orm_1.eq)(schema_1.submissions.submission_id, submissionId))
                .limit(1);
            return submission[0];
        }
        catch (error) {
            console.error('Error in getSubmissionById:', error);
            throw new errors_1.AppError(500, 'Failed to fetch submission');
        }
    });
}
function updateSubmission(submissionId, updateData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db_1.db.update(schema_1.submissions)
                .set({
                status: updateData.status,
                marks: updateData.marks,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.submissions.submission_id, submissionId));
            const updatedSubmission = yield getSubmissionById(submissionId);
            return updatedSubmission;
        }
        catch (error) {
            console.error('Error in updateSubmission:', error);
            throw new errors_1.AppError(500, 'Failed to update submission');
        }
    });
}
function getFacultyBatches(facultyId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const facultyBatches = yield db_1.db
                .select({
                batch_id: schema_1.batch.batch_id,
                division: schema_1.batch.division,
                batch_name: schema_1.batch.batch
            })
                .from(schema_1.batch)
                .innerJoin(schema_1.courses_faculty, (0, drizzle_orm_1.eq)(schema_1.batch.batch_id, schema_1.courses_faculty.batch_id))
                .where((0, drizzle_orm_1.eq)(schema_1.courses_faculty.faculty_id, facultyId));
            return facultyBatches;
        }
        catch (error) {
            console.error('Error in getFacultyBatches:', error);
            throw new errors_1.AppError(500, 'Failed to fetch faculty batches');
        }
    });
}
function getStudentSubmissions(studentId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const studentSubmissions = yield db_1.db
                .select({
                submission_id: schema_1.submissions.submission_id,
                practical_id: schema_1.submissions.practical_id,
                practical_sr_no: schema_1.practicals.sr_no,
                practical_name: schema_1.practicals.practical_name,
                course_name: schema_1.courses.course_name,
                submission_time: schema_1.submissions.submission_time,
                status: schema_1.submissions.status,
                marks: schema_1.submissions.marks,
            })
                .from(schema_1.submissions)
                .innerJoin(schema_1.practicals, (0, drizzle_orm_1.eq)(schema_1.submissions.practical_id, schema_1.practicals.practical_id))
                .innerJoin(schema_1.courses, (0, drizzle_orm_1.eq)(schema_1.practicals.course_id, schema_1.courses.course_id))
                .where((0, drizzle_orm_1.eq)(schema_1.submissions.student_id, studentId));
            return studentSubmissions;
        }
        catch (error) {
            console.error('Error in getStudentSubmissions:', error);
            throw new errors_1.AppError(500, 'Failed to fetch student submissions');
        }
    });
}
function getStudentDetails(studentId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const studentDetails = yield db_1.db
                .select({
                student_id: schema_1.students.student_id,
                name: schema_1.users.username,
                email: schema_1.users.email,
                roll_id: schema_1.students.roll_id,
                semester: schema_1.batch.semester,
                division: schema_1.batch.division,
                batch: schema_1.batch.batch,
            })
                .from(schema_1.students)
                .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.students.student_id, schema_1.users.user_id))
                .innerJoin(schema_1.batch, (0, drizzle_orm_1.eq)(schema_1.students.batch_id, schema_1.batch.batch_id))
                .where((0, drizzle_orm_1.eq)(schema_1.students.student_id, studentId))
                .limit(1);
            if (studentDetails.length === 0) {
                throw new errors_1.AppError(404, 'Student not found');
            }
            return studentDetails[0];
        }
        catch (error) {
            console.error('Error in getStudentDetails:', error);
            throw error instanceof errors_1.AppError ? error : new errors_1.AppError(500, 'Failed to fetch student details');
        }
    });
}
function updateStudent(studentId, updateData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db_1.db.update(schema_1.students)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.students.student_id, studentId));
            const updatedStudent = yield getStudentDetails(studentId);
            return updatedStudent;
        }
        catch (error) {
            console.error('Error in updateStudent:', error);
            throw new errors_1.AppError(500, 'Failed to update student');
        }
    });
}
function deleteStudent(studentId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db_1.db.delete(schema_1.students)
                .where((0, drizzle_orm_1.eq)(schema_1.students.student_id, studentId));
        }
        catch (error) {
            console.error('Error in deleteStudent:', error);
            throw new errors_1.AppError(500, 'Failed to delete student');
        }
    });
}
function getRunResult(token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`${JUDGE0_API_URL}/submissions/${token}?fields=status,stdout,stderr,time,memory`);
            return response.data;
        }
        catch (error) {
            console.error('Error in getRunResult:', error);
            throw new errors_1.AppError(500, 'Failed to get run result');
        }
    });
}
function getSubmissionStatus_(submissionId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const submissionData = yield redis_1.default.get(`submission:${submissionId}`);
            if (!submissionData) {
                throw new errors_1.AppError(404, 'Submission not found');
            }
            const data = JSON.parse(submissionData);
            const completed = data.status === 'completed';
            return {
                status: completed ? data.results.every((r) => r.status === 'Accepted') ? 'Accepted' : 'Rejected' : 'Processing',
                completed
            };
        }
        catch (error) {
            console.error('Error in getSubmissionStatus:', error);
            throw new errors_1.AppError(500, 'Failed to get submission status');
        }
    });
}
function storeSubmissionData(submissionData, results) {
    return __awaiter(this, void 0, void 0, function* () {
        const [result] = yield db_1.db.insert(schema_1.submissions).values({
            practical_id: submissionData.practicalId,
            student_id: submissionData.studentId,
            code_submitted: submissionData.code,
            status: 'Pending',
            submission_time: new Date()
        });
        const submissionId = result.insertId;
        const redisKey = `submission:${submissionId}`;
        yield redis_1.default.set(redisKey, JSON.stringify({
            results,
            status: 'processing',
            practicalId: submissionData.practicalId,
            studentId: submissionData.studentId,
            code: submissionData.code
        }), { EX: RESULTS_EXPIRY });
        return submissionId;
    });
}
function checkExistingSubmission(submissionData) {
    return __awaiter(this, void 0, void 0, function* () {
        return db_1.db
            .select()
            .from(schema_1.submissions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.submissions.practical_id, submissionData.practicalId), (0, drizzle_orm_1.eq)(schema_1.submissions.student_id, submissionData.studentId), (0, drizzle_orm_1.eq)(schema_1.submissions.status, 'Accepted')))
            .limit(1);
    });
}
function fetchAllTestCases(practicalId) {
    return __awaiter(this, void 0, void 0, function* () {
        return db_1.db
            .select()
            .from(schema_1.prac_io)
            .where((0, drizzle_orm_1.eq)(schema_1.prac_io.practical_id, practicalId));
    });
}
function saveSubmissionToDatabase(submissionData) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db_1.db.insert(schema_1.submissions).values({
            practical_id: submissionData.practicalId,
            student_id: submissionData.studentId,
            code_submitted: submissionData.code,
            submission_time: new Date(),
            status: 'Accepted',
            marks: 15
        });
    });
}
function checkRateLimit(userId, action) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = `ratelimit:${action}:${userId}`;
        const limit = action === 'submit' ? SUBMISSION_RATE_LIMIT : RUN_RATE_LIMIT;
        try {
            const lastAction = yield redis_1.default.get(key);
            if (lastAction) {
                return false;
            }
            yield redis_1.default.set(key, Date.now().toString(), { EX: limit });
            return true;
        }
        catch (error) {
            console.error(`Rate limit check failed for ${action}:`, error);
            return false;
        }
    });
}
function runCode(runData) {
    return __awaiter(this, void 0, void 0, function* () {
        const canRun = yield checkRateLimit(runData.userId, 'run');
        if (!canRun) {
            throw new errors_1.AppError(429, `Please wait ${RUN_RATE_LIMIT} seconds before running code again`);
        }
        try {
            const response = yield axios_1.default.post(`${JUDGE0_API_URL}/submissions`, {
                source_code: runData.code,
                language_id: parseInt(runData.language, 10),
                stdin: runData.input,
                redirect_stderr_to_stdout: true
            });
            const { token } = response.data;
            const result = yield waitForResult(token);
            return {
                output: result.stdout || result.stderr || 'No output',
                status: result.status.description,
                time: result.time,
                memory: result.memory
            };
        }
        catch (error) {
            console.error('Error in runCode:', error);
            if (error.response && error.response.status === 422) {
                console.error('Judge0 API Error:', error.response.data);
                throw new errors_1.AppError(422, 'Invalid request payload to Judge0 API');
            }
            throw new errors_1.AppError(500, 'Failed to run code');
        }
    });
}
function waitForResult(token_1) {
    return __awaiter(this, arguments, void 0, function* (token, timeout = SUBMISSION_TIMEOUT) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            try {
                const response = yield axios_1.default.get(`${JUDGE0_API_URL}/submissions/${token}`);
                if (response.data.status.id !== 1 && response.data.status.id !== 2) {
                    return response.data;
                }
                yield new Promise(resolve => setTimeout(resolve, 1000));
            }
            catch (error) {
                console.error('Error fetching result:', error);
                throw new errors_1.AppError(500, 'Failed to get result');
            }
        }
        throw new errors_1.AppError(504, 'Submission processing timeout');
    });
}
function createBatchSubmissions(code, language, testCases) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = [];
        for (let i = 0; i < testCases.length; i += BATCH_SIZE) {
            const batchTestCases = testCases.slice(i, i + BATCH_SIZE);
            const submissions = batchTestCases.map(testCase => ({
                source_code: code,
                language_id: language,
                stdin: testCase.input,
                expected_output: testCase.output,
                redirect_stderr_to_stdout: true
            }));
            const response = yield axios_1.default.post(`${JUDGE0_API_URL}/submissions/batch`, { submissions });
            results.push(...response.data.map((result, index) => ({
                token: result.token,
                input: batchTestCases[index].input,
                expectedOutput: batchTestCases[index].output
            })));
        }
        return results;
    });
}
function pollBatchResults(tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        let attempts = 0;
        const results = [];
        while (attempts < MAX_POLL_ATTEMPTS) {
            const batchTokens = tokens.join(',');
            const response = yield axios_1.default.get(`${JUDGE0_API_URL}/submissions/batch`, {
                params: {
                    tokens: batchTokens,
                    fields: 'token,status,stdout,stderr'
                }
            });
            const allCompleted = response.data.submissions.every((sub) => sub.status.id !== 1 && sub.status.id !== 2);
            if (allCompleted) {
                return response.data.submissions;
            }
            attempts++;
            yield new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
        }
        throw new errors_1.AppError(504, 'Submission processing timeout');
    });
}
function submitCode(submissionData) {
    return __awaiter(this, void 0, void 0, function* () {
        const testCases = yield db_1.db
            .select()
            .from(schema_1.prac_io)
            .where((0, drizzle_orm_1.eq)(schema_1.prac_io.practical_id, submissionData.practicalId));
        const batchResults = yield createBatchSubmissions(submissionData.code, submissionData.language, testCases);
        const [result] = yield db_1.db.insert(schema_1.submissions).values({
            practical_id: submissionData.practicalId,
            student_id: submissionData.studentId,
            code_submitted: submissionData.code,
            status: 'Pending',
            submission_time: new Date()
        });
        const submissionId = result.insertId;
        processSubmissionResults(submissionId, batchResults).catch(console.error);
        return { submissionId };
    });
}
function processSubmissionResults(submissionId, results) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tokens = results.map(r => r.token);
            const batchResults = yield pollBatchResults(tokens);
            console.log(batchResults);
            const allPassed = batchResults.every(result => result.status.id === 3);
            const status = allPassed ? 'Accepted' : 'Rejected';
            yield db_1.db.update(schema_1.submissions)
                .set({
                status,
                marks: allPassed ? 15 : 0
            })
                .where((0, drizzle_orm_1.eq)(schema_1.submissions.submission_id, submissionId));
            yield redis_1.default.set(`submission:${submissionId}`, JSON.stringify({
                status,
                completed: true
            }), { EX: RESULTS_EXPIRY });
        }
        catch (error) {
            console.error('Error processing submission results:', error);
            yield db_1.db.update(schema_1.submissions)
                .set({ status: 'Rejected' })
                .where((0, drizzle_orm_1.eq)(schema_1.submissions.submission_id, submissionId));
        }
    });
}
function getSubmissionStatus(submissionId) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield redis_1.default.get(`submission:${submissionId}`);
        console.log(data);
        if (!data) {
            const [submission] = yield db_1.db
                .select()
                .from(schema_1.submissions)
                .where((0, drizzle_orm_1.eq)(schema_1.submissions.submission_id, parseInt(submissionId)))
                .limit(1);
            if (!submission) {
                throw new errors_1.AppError(404, 'Submission not found');
            }
            return {
                status: submission.status,
                completed: submission.status !== 'Pending'
            };
        }
        return JSON.parse(data);
    });
}
function updateSubmissionCode(submissionData) {
    return __awaiter(this, void 0, void 0, function* () {
        const testCases = yield db_1.db
            .select()
            .from(schema_1.prac_io)
            .where((0, drizzle_orm_1.eq)(schema_1.prac_io.practical_id, submissionData.practicalId));
        const batchResults = yield createBatchSubmissions(submissionData.code, submissionData.language, testCases);
        yield db_1.db.update(schema_1.submissions)
            .set({
            code_submitted: submissionData.code,
            status: 'Pending',
            submission_time: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.submissions.submission_id, submissionData.submissionId));
        processSubmissionResults(submissionData.submissionId, batchResults).catch(console.error);
        return { submissionId: submissionData.submissionId };
    });
}
