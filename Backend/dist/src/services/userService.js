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
exports.getUserById = getUserById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.getAllUsers = getAllUsers;
const db_1 = require("./../config/db");
const schema_1 = require("./../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const errors_1 = require("./../utils/errors");
function getUserById(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.user_id, userId)).limit(1);
        if (user.length === 0) {
            throw new errors_1.AppError(404, 'User not found');
        }
        const userData = user[0];
        if (userData.role === 'Faculty' || userData.role === 'HOD') {
            const facultyData = yield db_1.db.select().from(schema_1.faculty).where((0, drizzle_orm_1.eq)(schema_1.faculty.faculty_id, userId)).limit(1);
            if (facultyData.length > 0) {
                return Object.assign(Object.assign({}, userData), facultyData[0]);
            }
        }
        if (userData.role === 'Student') {
            const studentData = yield db_1.db.select().from(schema_1.students).where((0, drizzle_orm_1.eq)(schema_1.students.student_id, userId)).limit(1);
            if (studentData.length > 0) {
                return Object.assign(Object.assign({}, userData), studentData[0]);
            }
        }
        return userData;
    });
}
function updateUser(userId, userData) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db_1.db.update(schema_1.users)
            .set(userData)
            .where((0, drizzle_orm_1.eq)(schema_1.users.user_id, userId));
        const updatedUser = yield db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.user_id, userId)).limit(1);
        if (!updatedUser[0]) {
            throw new errors_1.AppError(404, 'User not found');
        }
        return updatedUser[0];
    });
}
function deleteUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield db_1.db.delete(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.user_id, userId));
        if (result[0].affectedRows === 0) {
            throw new errors_1.AppError(404, 'User not found');
        }
    });
}
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield db_1.db.select().from(schema_1.users);
    });
}
