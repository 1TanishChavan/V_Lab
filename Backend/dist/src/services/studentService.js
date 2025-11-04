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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentSubmissions = getStudentSubmissions;
exports.getStudentsWithFilters = getStudentsWithFilters;
exports.getStudentsWithDepartment = getStudentsWithDepartment;
exports.getDepartments = getDepartments;
exports.getSemesters = getSemesters;
exports.getDivisions = getDivisions;
exports.getBatches = getBatches;
exports.getStudentsByBatch = getStudentsByBatch;
exports.getStudentByRollId = getStudentByRollId;
exports.getStudentsByDepartment = getStudentsByDepartment;
exports.getStudentsByDepartmentAndSemester = getStudentsByDepartmentAndSemester;
exports.getBatchesByDepartmentAndSemester = getBatchesByDepartmentAndSemester;
const db_1 = require("./../config/db");
const schema_1 = require("./../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const errors_1 = require("./../utils/errors");
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
function getStudentsWithFilters(filters) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let query = db_1.db
                .select({
                student_id: schema_1.students.student_id,
                name: schema_1.users.username,
                roll_id: schema_1.students.roll_id,
                email: schema_1.users.email,
                semester: schema_1.batch.semester,
                division: schema_1.batch.division,
                batch: schema_1.batch.batch,
                department_name: schema_1.departments.name,
            })
                .from(schema_1.students)
                .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.students.student_id, schema_1.users.user_id))
                .innerJoin(schema_1.batch, (0, drizzle_orm_1.eq)(schema_1.students.batch_id, schema_1.batch.batch_id))
                .innerJoin(schema_1.departments, (0, drizzle_orm_1.eq)(schema_1.batch.department_id, schema_1.departments.department_id));
            if (filters.department) {
                query = query.where((0, drizzle_orm_1.eq)(schema_1.departments.name, filters.department));
            }
            if (filters.semester) {
                query = query.where((0, drizzle_orm_1.eq)(schema_1.batch.semester, parseInt(filters.semester)));
            }
            if (filters.division) {
                query = query.where((0, drizzle_orm_1.eq)(schema_1.batch.division, filters.division));
            }
            if (filters.batch) {
                query = query.where((0, drizzle_orm_1.eq)(schema_1.batch.batch, filters.batch));
            }
            return yield query;
        }
        catch (error) {
            console.error('Error in getStudentsWithFilters:', error);
            throw new errors_1.AppError(500, 'Failed to fetch students');
        }
    });
}
function getStudentsWithDepartment() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield db_1.db.select({
            user_id: schema_1.users.user_id,
            username: schema_1.users.username,
            email: schema_1.users.email,
            department_name: schema_1.departments.name,
            semester: schema_1.batch.semester,
            batch: schema_1.batch.batch,
            roll_id: schema_1.students.roll_id,
            division: schema_1.batch.division
        })
            .from(schema_1.users)
            .innerJoin(schema_1.students, (0, drizzle_orm_1.eq)(schema_1.users.user_id, schema_1.students.student_id))
            .innerJoin(schema_1.batch, (0, drizzle_orm_1.eq)(schema_1.students.batch_id, schema_1.batch.batch_id))
            .innerJoin(schema_1.departments, (0, drizzle_orm_1.eq)(schema_1.batch.department_id, schema_1.departments.department_id))
            .where((0, drizzle_orm_1.eq)(schema_1.users.role, 'Student'));
    });
}
function getDepartments() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield db_1.db
                .select({
                id: schema_1.departments.department_id,
                name: schema_1.departments.name,
            })
                .from(schema_1.departments);
        }
        catch (error) {
            console.error('Error in getDepartments:', error);
            throw new errors_1.AppError(500, 'Failed to fetch departments');
        }
    });
}
function getSemesters() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield db_1.db
                .select({
                semester: schema_1.courses.semester,
            })
                .from(schema_1.courses)
                .groupBy(schema_1.courses.semester)
                .orderBy(schema_1.courses.semester);
            return result.map(row => row.semester);
        }
        catch (error) {
            console.error('Error in getSemesters:', error);
            throw new errors_1.AppError(500, 'Failed to fetch semesters');
        }
    });
}
function getDivisions() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield db_1.db
                .select({
                division: schema_1.batch.division,
            })
                .from(schema_1.batch)
                .groupBy(schema_1.batch.division)
                .orderBy(schema_1.batch.division);
            return result.map(row => row.division);
        }
        catch (error) {
            console.error('Error in getDivisions:', error);
            throw new errors_1.AppError(500, 'Failed to fetch divisions');
        }
    });
}
function getBatches() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield db_1.db
                .select({
                batch: schema_1.batch.batch,
            })
                .from(schema_1.batch)
                .groupBy(schema_1.batch.batch)
                .orderBy(schema_1.batch.batch);
            return result.map(row => row.batch);
        }
        catch (error) {
            console.error('Error in getBatches:', error);
            throw new errors_1.AppError(500, 'Failed to fetch batches');
        }
    });
}
function getStudentsByBatch(batchId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const students_ = yield db_1.db
                .select({
                student_id: schema_1.students.student_id,
                name: schema_1.users.username,
                email: schema_1.users.email,
                roll_id: schema_1.students.roll_id,
                batch: schema_1.batch.batch,
                division: schema_1.batch.division,
                semester: schema_1.batch.semester
            })
                .from(schema_1.students)
                .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.users.user_id, schema_1.students.student_id))
                .innerJoin(schema_1.batch, (0, drizzle_orm_1.eq)(schema_1.batch.batch_id, schema_1.students.batch_id))
                .where((0, drizzle_orm_1.eq)(schema_1.batch.batch_id, batchId));
            return students_;
        }
        catch (error) {
            console.error('Error in getStudentsByBatch:', error);
            throw new errors_1.AppError(500, 'Failed to fetch students by batch');
        }
    });
}
function getStudentByRollId(rollId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const student = yield db_1.db
                .select({
                student_id: schema_1.students.student_id,
                name: schema_1.users.username,
                email: schema_1.users.email,
                roll_id: schema_1.students.roll_id,
                batch: schema_1.batch.batch,
                division: schema_1.batch.division,
                semester: schema_1.batch.semester
            })
                .from(schema_1.students)
                .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.users.user_id, schema_1.students.student_id))
                .innerJoin(schema_1.batch, (0, drizzle_orm_1.eq)(schema_1.batch.batch_id, schema_1.students.batch_id))
                .where((0, drizzle_orm_1.eq)(schema_1.students.roll_id, rollId))
                .limit(1);
            if (!student.length) {
                throw new errors_1.AppError(404, 'Student not found');
            }
            return student[0];
        }
        catch (error) {
            if (error instanceof errors_1.AppError)
                throw error;
            console.error('Error in getStudentByRollId:', error);
            throw new errors_1.AppError(500, 'Failed to fetch student');
        }
    });
}
function getStudentsByDepartment(departmentId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const students_ = yield db_1.db
                .select({
                student_id: schema_1.students.student_id,
                name: schema_1.users.username,
                email: schema_1.users.email,
                roll_id: schema_1.students.roll_id,
                batch: schema_1.batch.batch,
                division: schema_1.batch.division,
                semester: schema_1.batch.semester,
                department_name: schema_1.departments.name
            })
                .from(schema_1.students)
                .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.users.user_id, schema_1.students.student_id))
                .innerJoin(schema_1.batch, (0, drizzle_orm_1.eq)(schema_1.batch.batch_id, schema_1.students.batch_id))
                .innerJoin(schema_1.departments, (0, drizzle_orm_1.eq)(schema_1.departments.department_id, schema_1.batch.department_id))
                .where((0, drizzle_orm_1.eq)(schema_1.departments.department_id, parseInt(departmentId)));
            return students_;
        }
        catch (error) {
            console.error('Error in getStudentsByDepartment:', error);
            throw new errors_1.AppError(500, 'Failed to fetch students by department');
        }
    });
}
function getStudentsByDepartmentAndSemester(departmentId, semester) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const students_ = yield db_1.db
                .select({
                student_id: schema_1.students.student_id,
                name: schema_1.users.username,
                email: schema_1.users.email,
                roll_id: schema_1.students.roll_id,
                batch: schema_1.batch.batch,
                division: schema_1.batch.division,
                semester: schema_1.batch.semester
            })
                .from(schema_1.students)
                .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.users.user_id, schema_1.students.student_id))
                .innerJoin(schema_1.batch, (0, drizzle_orm_1.eq)(schema_1.batch.batch_id, schema_1.students.batch_id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.batch.department_id, departmentId), (0, drizzle_orm_1.eq)(schema_1.batch.semester, semester)));
            return students_;
        }
        catch (error) {
            console.error('Error in getStudentsByDepartmentAndSemester:', error);
            throw new errors_1.AppError(500, 'Failed to fetch students');
        }
    });
}
function getBatchesByDepartmentAndSemester(departmentId, semester) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const batches = yield db_1.db
                .select({
                batch_id: schema_1.batch.batch_id,
                batch: schema_1.batch.batch,
                division: schema_1.batch.division
            })
                .from(schema_1.batch)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.batch.department_id, departmentId), (0, drizzle_orm_1.eq)(schema_1.batch.semester, semester)));
            return batches;
        }
        catch (error) {
            console.error('Error in getBatchesByDepartmentAndSemester:', error);
            throw new errors_1.AppError(500, 'Failed to fetch batches');
        }
    });
}
