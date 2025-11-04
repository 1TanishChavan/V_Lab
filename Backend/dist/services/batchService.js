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
exports.createBatch = createBatch;
exports.updateBatch = updateBatch;
exports.deleteBatch = deleteBatch;
exports.getBatchesByDepartmentAndSemester = getBatchesByDepartmentAndSemester;
exports.getBatches = getBatches;
const db_1 = require("../config/db");
const schema_1 = require("../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const errors_1 = require("../utils/errors");
function createBatch(batchData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield db_1.db.insert(schema_1.batch).values(batchData);
            return yield db_1.db.select().from(schema_1.batch).where((0, drizzle_orm_1.eq)(schema_1.batch.batch_id, result[0].insertId)).limit(1);
        }
        catch (error) {
            console.error('Error in createBatch:', error);
            throw new errors_1.AppError(500, 'Internal server error');
        }
    });
}
function updateBatch(id, batchData) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db_1.db.update(schema_1.batch)
            .set(batchData)
            .where((0, drizzle_orm_1.eq)(schema_1.batch.batch_id, id));
        const updatedBatch = yield db_1.db.select().from(schema_1.batch).where((0, drizzle_orm_1.eq)(schema_1.batch.batch_id, id)).limit(1);
        if (!updatedBatch[0]) {
            throw new errors_1.AppError(404, 'Batch not found');
        }
        return updatedBatch[0];
    });
}
function deleteBatch(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield db_1.db.delete(schema_1.batch).where((0, drizzle_orm_1.eq)(schema_1.batch.batch_id, id));
        if (result[0].affectedRows === 0) {
            throw new errors_1.AppError(404, 'Batch not found');
        }
    });
}
function getBatchesByDepartmentAndSemester(departmentId, semester) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield db_1.db.select()
            .from(schema_1.batch)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.batch.department_id, departmentId), (0, drizzle_orm_1.eq)(schema_1.batch.semester, semester)));
    });
}
function getBatches() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield db_1.db.select()
            .from(schema_1.batch);
    });
}
