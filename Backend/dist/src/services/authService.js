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
exports.registerUser = registerUser;
exports.loginUser = loginUser;
const db_1 = require("../config/db");
const schema_1 = require("../models/schema");
const jwtUtils_1 = require("../utils/jwtUtils");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt_1 = __importDefault(require("bcrypt"));
const errors_1 = require("../utils/errors");
function registerUser(userData) {
    return __awaiter(this, void 0, void 0, function* () {
        const hashedPassword = yield bcrypt_1.default.hash(userData.password, 10);
        const result = yield db_1.db.insert(schema_1.users).values({
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            role: userData.role,
        });
        const newUser = yield db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.user_id, result[0].insertId)).limit(1);
        let additionalDetails = {};
        if (userData.role === 'Student') {
            yield db_1.db.insert(schema_1.students).values({
                student_id: result[0].insertId,
                batch_id: userData.batch_id,
                roll_id: userData.roll_id,
            });
            const studentDetails = yield db_1.db.select({
                batch_id: schema_1.students.batch_id,
                roll_id: schema_1.students.roll_id,
                department_id: schema_1.batch.department_id,
                semester: schema_1.batch.semester,
                division: schema_1.batch.division,
                batch: schema_1.batch.batch,
            }).from(schema_1.students)
                .innerJoin(schema_1.batch, (0, drizzle_orm_1.eq)(schema_1.students.batch_id, schema_1.batch.batch_id))
                .where((0, drizzle_orm_1.eq)(schema_1.students.student_id, result[0].insertId));
            additionalDetails = studentDetails[0];
        }
        else if (userData.role === 'Faculty' || userData.role === 'HOD' || userData.role === 'Admin') {
            yield db_1.db.insert(schema_1.faculty).values({
                faculty_id: result[0].insertId,
                department_id: userData.department_id,
            });
            const facultyDetails = yield db_1.db.select({
                department_id: schema_1.faculty.department_id,
            }).from(schema_1.faculty)
                .where((0, drizzle_orm_1.eq)(schema_1.faculty.faculty_id, result[0].insertId));
            additionalDetails = facultyDetails[0];
        }
        const token = (0, jwtUtils_1.generateToken)({ id: result[0].insertId, role: userData.role });
        return {
            token,
            user: Object.assign(Object.assign({}, newUser[0]), additionalDetails)
        };
    });
}
function loginUser(loginData) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, loginData.email)).limit(1);
        if (user.length === 0) {
            throw new errors_1.AppError(404, 'User not found');
        }
        const isPasswordValid = yield bcrypt_1.default.compare(loginData.password, user[0].password);
        if (!isPasswordValid) {
            throw new errors_1.AppError(401, 'Invalid credentials');
        }
        const token = (0, jwtUtils_1.generateToken)({ id: user[0].user_id, role: user[0].role });
        let additionalDetails = {};
        if (user[0].role === 'Student') {
            const studentDetails = yield db_1.db.select({
                batch_id: schema_1.students.batch_id,
                roll_id: schema_1.students.roll_id,
                department_id: schema_1.batch.department_id,
                semester: schema_1.batch.semester,
                division: schema_1.batch.division,
                batch: schema_1.batch.batch,
            }).from(schema_1.students)
                .innerJoin(schema_1.batch, (0, drizzle_orm_1.eq)(schema_1.students.batch_id, schema_1.batch.batch_id))
                .where((0, drizzle_orm_1.eq)(schema_1.students.student_id, user[0].user_id));
            additionalDetails = studentDetails[0];
        }
        else if (user[0].role === 'Faculty' || user[0].role === 'HOD') {
            const facultyDetails = yield db_1.db.select({
                department_id: schema_1.faculty.department_id,
            }).from(schema_1.faculty)
                .where((0, drizzle_orm_1.eq)(schema_1.faculty.faculty_id, user[0].user_id));
            additionalDetails = facultyDetails[0];
        }
        return { token, user: Object.assign(Object.assign({}, user[0]), additionalDetails) };
    });
}
