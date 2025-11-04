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
exports.getAllCourses = getAllCourses;
exports.createCourse = createCourse;
exports.updateCourse = updateCourse;
exports.deleteCourse = deleteCourse;
exports.getCoursesBySemesterAndDepartment = getCoursesBySemesterAndDepartment;
exports.getCoursesByDepartment = getCoursesByDepartment;
exports.getCoursesById = getCoursesById;
const db_1 = require("./../config/db");
const schema_1 = require("./../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const errors_1 = require("./../utils/errors");
function getAllCourses() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield db_1.db.select().from(schema_1.courses);
    });
}
function createCourse(courseData) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield db_1.db.insert(schema_1.courses).values(courseData);
        return yield db_1.db.select().from(schema_1.courses).where((0, drizzle_orm_1.eq)(schema_1.courses.course_id, result[0].insertId)).limit(1);
    });
}
function updateCourse(id, courseData) {
    return __awaiter(this, void 0, void 0, function* () {
        const course = yield db_1.db.select().from(schema_1.courses).where((0, drizzle_orm_1.eq)(schema_1.courses.course_id, id)).limit(1);
        if (!course[0]) {
            throw new errors_1.AppError(404, 'Course not found');
        }
        yield db_1.db.update(schema_1.courses)
            .set(courseData)
            .where((0, drizzle_orm_1.eq)(schema_1.courses.course_id, id));
        return yield db_1.db.select().from(schema_1.courses).where((0, drizzle_orm_1.eq)(schema_1.courses.course_id, id)).limit(1);
    });
}
function deleteCourse(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const course = yield db_1.db.select().from(schema_1.courses).where((0, drizzle_orm_1.eq)(schema_1.courses.course_id, id)).limit(1);
        if (!course[0]) {
            throw new errors_1.AppError(404, 'Course not found');
        }
        yield db_1.db.delete(schema_1.courses).where((0, drizzle_orm_1.eq)(schema_1.courses.course_id, id));
    });
}
function getCoursesBySemesterAndDepartment(semester, departmentId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield db_1.db.select()
            .from(schema_1.courses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courses.semester, semester), (0, drizzle_orm_1.eq)(schema_1.courses.department_id, departmentId)));
    });
}
function getCoursesByDepartment(departmentId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield db_1.db.select()
            .from(schema_1.courses)
            .where((0, drizzle_orm_1.eq)(schema_1.courses.department_id, departmentId));
    });
}
function getCoursesById(courseId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield db_1.db
            .select({
            course_id: schema_1.courses.course_id,
            course_name: schema_1.courses.course_name,
            course_code: schema_1.courses.course_code,
            semester: schema_1.courses.semester,
            department_id: schema_1.courses.department_id,
            department_name: schema_1.departments.name,
        })
            .from(schema_1.courses)
            .innerJoin(schema_1.departments, (0, drizzle_orm_1.eq)(schema_1.courses.department_id, schema_1.departments.department_id))
            .where((0, drizzle_orm_1.eq)(schema_1.courses.course_id, courseId))
            .limit(1);
    });
}
