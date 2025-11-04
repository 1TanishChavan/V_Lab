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
exports.createFaculty = createFaculty;
exports.getFacultyBatches = getFacultyBatches;
exports.getAllFaculty = getAllFaculty;
exports.getFacultyByDepartment_omkar = getFacultyByDepartment_omkar;
exports.getFacultyByDepartment_tanish = getFacultyByDepartment_tanish;
exports.deleteFaculty = deleteFaculty;
exports.getFacultyDetails = getFacultyDetails;
const db_1 = require("./../config/db");
const schema_1 = require("./../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const errors_1 = require("./../utils/errors");
function createFaculty(_a) {
    return __awaiter(this, arguments, void 0, function* ({ username, email, password, department_id, role, }) {
        var _b;
        try {
            const newUser = yield db_1.db.insert(schema_1.users).values({
                username,
                email,
                password,
                role,
            });
            const insertedUser = yield db_1.db
                .select({ user_id: schema_1.users.user_id })
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.username, username));
            const userId = (_b = insertedUser[0]) === null || _b === void 0 ? void 0 : _b.user_id;
            if (!userId) {
                throw new errors_1.AppError(500, 'Failed to retrieve new user ID');
            }
            yield db_1.db.insert(schema_1.faculty).values({
                faculty_id: userId,
                department_id,
            });
            return { user_id: userId, username, email, role, department_id };
        }
        catch (error) {
            console.error('Error in createFaculty:', error);
            throw new errors_1.AppError(500, 'Failed to create faculty');
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
                batch_name: schema_1.batch.batch,
            })
                .from(schema_1.batch)
                .innerJoin(schema_1.courses_faculty, (0, drizzle_orm_1.eq)(schema_1.batch.batch_id, schema_1.courses_faculty.batch_id))
                .where((0, drizzle_orm_1.eq)(schema_1.courses_faculty.faculty_id, facultyId));
            return facultyBatches;
        }
        catch (error) {
            console.error('Error fetching faculty batches:', error);
            throw new errors_1.AppError(500, `Failed to fetch faculty batches: ${error.message}`);
        }
    });
}
function getAllFaculty() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const facultyMembers = yield db_1.db
                .select({
                user_id: schema_1.faculty.faculty_id,
                department_id: schema_1.faculty.department_id,
                username: schema_1.users.username,
                email: schema_1.users.email,
                role: schema_1.users.role,
                department: schema_1.departments.name,
            })
                .from(schema_1.faculty)
                .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.faculty.faculty_id, schema_1.users.user_id))
                .innerJoin(schema_1.departments, (0, drizzle_orm_1.eq)(schema_1.faculty.department_id, schema_1.departments.department_id));
            console.log("Faculty Members:", facultyMembers);
            if (!facultyMembers.length) {
                throw new errors_1.AppError(404, 'No faculty members found');
            }
            return facultyMembers;
        }
        catch (error) {
            console.error("Error in getAllFaculty:", error);
            throw error;
        }
    });
}
function getFacultyByDepartment_omkar(departmentId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield db_1.db
                .select({
                faculty_id: schema_1.faculty.faculty_id,
                department_id: schema_1.faculty.department_id,
                username: schema_1.users.username,
                email: schema_1.users.email,
                role: schema_1.users.role,
                department: schema_1.departments.name
            })
                .from(schema_1.users)
                .innerJoin(schema_1.faculty, (0, drizzle_orm_1.eq)(schema_1.users.user_id, schema_1.faculty.faculty_id))
                .innerJoin(schema_1.departments, (0, drizzle_orm_1.eq)(schema_1.faculty.department_id, schema_1.departments.department_id))
                .where((0, drizzle_orm_1.eq)(schema_1.faculty.department_id, departmentId));
        }
        catch (error) {
            console.error('Error fetching faculty by department:', error);
            throw new errors_1.AppError(500, 'Failed to fetch faculty by department');
        }
    });
}
function getFacultyByDepartment_tanish(departmentId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const facultyMembers = yield db_1.db
                .select({
                user_id: schema_1.faculty.faculty_id,
                department_id: schema_1.faculty.department_id,
                username: schema_1.users.username,
                email: schema_1.users.email,
            })
                .from(schema_1.faculty)
                .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.faculty.faculty_id, schema_1.users.user_id))
                .where((0, drizzle_orm_1.eq)(schema_1.faculty.department_id, departmentId));
            if (!facultyMembers.length) {
                throw new errors_1.AppError(404, 'No faculty members found in this department');
            }
            return facultyMembers;
        }
        catch (error) {
            console.error("Error in getFacultyByDepartment:", error);
            throw error;
        }
    });
}
function deleteFaculty(facultyId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const facultyRecord = yield db_1.db
                .select({
                user_id: schema_1.faculty.faculty_id,
            })
                .from(schema_1.faculty)
                .where((0, drizzle_orm_1.eq)(schema_1.faculty.faculty_id, facultyId));
            const userId = (_a = facultyRecord[0]) === null || _a === void 0 ? void 0 : _a.user_id;
            if (!userId) {
                throw new errors_1.AppError(404, 'Faculty not found');
            }
            yield db_1.db.delete(schema_1.faculty).where((0, drizzle_orm_1.eq)(schema_1.faculty.faculty_id, facultyId));
            yield db_1.db.delete(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.user_id, userId));
        }
        catch (error) {
            console.error('Error deleting faculty:', error);
            throw new errors_1.AppError(500, 'Failed to delete faculty');
        }
    });
}
function getFacultyDetails(facultyId) {
    return __awaiter(this, void 0, void 0, function* () {
        const facultyDetails = yield db_1.db
            .select({
            user_id: schema_1.users.user_id,
            username: schema_1.users.username,
            email: schema_1.users.email,
            department_id: schema_1.faculty.department_id,
            faculty_id: schema_1.faculty.faculty_id,
        })
            .from(schema_1.users)
            .innerJoin(schema_1.faculty, (0, drizzle_orm_1.eq)(schema_1.users.user_id, schema_1.faculty.faculty_id))
            .where((0, drizzle_orm_1.eq)(schema_1.faculty.faculty_id, facultyId))
            .limit(1);
        if (facultyDetails.length === 0) {
            throw new errors_1.AppError(404, 'Faculty not found');
        }
        return facultyDetails[0];
    });
}
