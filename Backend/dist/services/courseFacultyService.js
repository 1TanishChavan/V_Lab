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
exports.deleteCourseFacultyAssignment = deleteCourseFacultyAssignment;
exports.getCoursesByFaculty = getCoursesByFaculty;
exports.assignCourseToFaculty = assignCourseToFaculty;
exports.updateCourseFacultyAssignment = updateCourseFacultyAssignment;
exports.getFacultyByCourse = getFacultyByCourse;
const db_1 = require("../config/db");
const schema_1 = require("../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const errors_1 = require("../utils/errors");
function deleteCourseFacultyAssignment(courseId, batchId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield db_1.db.delete(schema_1.courses_faculty)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courses_faculty.course_id, courseId), (0, drizzle_orm_1.eq)(schema_1.courses_faculty.batch_id, batchId)));
        if (result[0].affectedRows === 0) {
            throw new errors_1.AppError(404, 'Assignment not found');
        }
    });
}
function getCoursesByFaculty(facultyId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield db_1.db.select().from(schema_1.courses_faculty)
            .innerJoin(schema_1.courses, (0, drizzle_orm_1.eq)(schema_1.courses_faculty.course_id, schema_1.courses.course_id))
            .where((0, drizzle_orm_1.eq)(schema_1.courses_faculty.faculty_id, facultyId));
    });
}
function assignCourseToFaculty(assignmentData) {
    return __awaiter(this, void 0, void 0, function* () {
        const { course_id, faculty_id, batch_id } = assignmentData;
        try {
            const facultyMember = yield db_1.db
                .select()
                .from(schema_1.faculty)
                .where((0, drizzle_orm_1.eq)(schema_1.faculty.faculty_id, faculty_id))
                .limit(1);
            const courseDetails = yield db_1.db
                .select()
                .from(schema_1.courses)
                .where((0, drizzle_orm_1.eq)(schema_1.courses.course_id, course_id))
                .limit(1);
            if (!facultyMember.length) {
                throw new errors_1.AppError(404, 'Faculty not found');
            }
            if (!courseDetails.length) {
                throw new errors_1.AppError(404, 'Course not found');
            }
            const existingAssignment = yield db_1.db
                .select()
                .from(schema_1.courses_faculty)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courses_faculty.course_id, course_id), (0, drizzle_orm_1.eq)(schema_1.courses_faculty.batch_id, batch_id)))
                .limit(1);
            if (existingAssignment.length > 0) {
                const result = yield db_1.db
                    .update(schema_1.courses_faculty)
                    .set({ faculty_id })
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courses_faculty.course_id, course_id), (0, drizzle_orm_1.eq)(schema_1.courses_faculty.batch_id, batch_id)));
                if (!result[0].affectedRows) {
                    throw new errors_1.AppError(500, 'Failed to update faculty assignment');
                }
            }
            else {
                yield db_1.db.insert(schema_1.courses_faculty).values(assignmentData);
            }
            return yield getFacultyAssignment(course_id, batch_id);
        }
        catch (error) {
            console.error("Error in assignCourseToFaculty:", error);
            throw error;
        }
    });
}
function updateCourseFacultyAssignment(courseId, batchId, facultyId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const existingAssignment = yield getFacultyAssignment(courseId, batchId);
            if (!existingAssignment) {
                return yield assignCourseToFaculty({
                    course_id: courseId,
                    faculty_id: facultyId,
                    batch_id: batchId
                });
            }
            const result = yield db_1.db
                .update(schema_1.courses_faculty)
                .set({ faculty_id: facultyId })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courses_faculty.course_id, courseId), (0, drizzle_orm_1.eq)(schema_1.courses_faculty.batch_id, batchId)));
            if (!result[0].affectedRows) {
                throw new errors_1.AppError(404, 'Assignment not found');
            }
            return yield getFacultyAssignment(courseId, batchId);
        }
        catch (error) {
            console.error("Error in updateCourseFacultyAssignment:", error);
            throw error;
        }
    });
}
function getFacultyByCourse(courseId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield db_1.db
                .select({
                course_id: schema_1.courses_faculty.course_id,
                faculty_id: schema_1.courses_faculty.faculty_id,
                batch_id: schema_1.courses_faculty.batch_id,
                faculty_name: schema_1.users.username,
                batch_name: schema_1.batch.batch,
                division: schema_1.batch.division
            })
                .from(schema_1.courses_faculty)
                .innerJoin(schema_1.faculty, (0, drizzle_orm_1.eq)(schema_1.courses_faculty.faculty_id, schema_1.faculty.faculty_id))
                .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.faculty.faculty_id, schema_1.users.user_id))
                .innerJoin(schema_1.batch, (0, drizzle_orm_1.eq)(schema_1.courses_faculty.batch_id, schema_1.batch.batch_id))
                .where((0, drizzle_orm_1.eq)(schema_1.courses_faculty.course_id, courseId));
        }
        catch (error) {
            console.error("Error in getFacultyByCourse:", error);
            throw error;
        }
    });
}
function getFacultyAssignment(courseId, batchId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const assignment = yield db_1.db
                .select()
                .from(schema_1.courses_faculty)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courses_faculty.course_id, courseId), (0, drizzle_orm_1.eq)(schema_1.courses_faculty.batch_id, batchId)))
                .limit(1);
            return assignment[0];
        }
        catch (error) {
            console.error("Error in getFacultyAssignment:", error);
            throw error;
        }
    });
}
