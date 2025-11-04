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
exports.getAllDepartments = getAllDepartments;
exports.createDepartment = createDepartment;
exports.updateDepartment = updateDepartment;
exports.deleteDepartment = deleteDepartment;
exports.getDepartmentById = getDepartmentById;
const db_1 = require("./../config/db");
const schema_1 = require("./../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const errors_1 = require("./../utils/errors");
function getAllDepartments() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield db_1.db.select().from(schema_1.departments);
    });
}
function createDepartment(departmentData) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield db_1.db.insert(schema_1.departments).values(departmentData.name);
        return yield db_1.db.select().from(schema_1.departments).where((0, drizzle_orm_1.eq)(schema_1.departments.department_id, result[0].insertId)).limit(1);
    });
}
function updateDepartment(id, departmentData) {
    return __awaiter(this, void 0, void 0, function* () {
        const department = yield db_1.db.select().from(schema_1.departments).where((0, drizzle_orm_1.eq)(schema_1.departments.department_id, id)).limit(1);
        if (!department[0]) {
            throw new errors_1.AppError(404, 'Department not found');
        }
        yield db_1.db.update(schema_1.departments)
            .set(departmentData.name)
            .where((0, drizzle_orm_1.eq)(schema_1.departments.department_id, id));
        return yield db_1.db.select().from(schema_1.departments).where((0, drizzle_orm_1.eq)(schema_1.departments.department_id, id)).limit(1);
    });
}
function deleteDepartment(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const department = yield db_1.db.select().from(schema_1.departments).where((0, drizzle_orm_1.eq)(schema_1.departments.department_id, id)).limit(1);
        if (!department[0]) {
            throw new errors_1.AppError(404, 'Department not found');
        }
        yield db_1.db.delete(schema_1.departments).where((0, drizzle_orm_1.eq)(schema_1.departments.department_id, id));
    });
}
function getDepartmentById(departmentId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield db_1.db.select()
            .from(schema_1.departments)
            .where((0, drizzle_orm_1.eq)(schema_1.departments.department_id, departmentId))
            .limit(1);
    });
}
