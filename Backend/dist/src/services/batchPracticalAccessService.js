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
exports.createOrUpdateBatchPracticalAccess = createOrUpdateBatchPracticalAccess;
exports.getBatchPracticalAccess = getBatchPracticalAccess;
const db_1 = require("../config/db");
const schema_1 = require("../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
function createOrUpdateBatchPracticalAccess(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingAccess = yield db_1.db
            .select()
            .from(schema_1.batch_practical_access)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.batch_practical_access.practical_id, data.practical_id), (0, drizzle_orm_1.eq)(schema_1.batch_practical_access.batch_id, data.batch_id)))
            .limit(1);
        if (existingAccess.length > 0) {
            return yield db_1.db
                .update(schema_1.batch_practical_access)
                .set({ lock: data.lock, deadline: data.deadline })
                .where((0, drizzle_orm_1.eq)(schema_1.batch_practical_access.batch_practical_access_id, existingAccess[0].batch_practical_access_id));
        }
        else {
            return yield db_1.db.insert(schema_1.batch_practical_access).values(data);
        }
    });
}
function getBatchPracticalAccess(practicalId, courseId, facultyId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield db_1.db
            .select({
            batch_practical_access_id: schema_1.batch_practical_access.batch_practical_access_id,
            batch_id: schema_1.batch.batch_id,
            division: schema_1.batch.division,
            batch_name: schema_1.batch.batch,
            lock: schema_1.batch_practical_access.lock,
            deadline: schema_1.batch_practical_access.deadline,
        })
            .from(schema_1.courses_faculty)
            .innerJoin(schema_1.batch, (0, drizzle_orm_1.eq)(schema_1.courses_faculty.batch_id, schema_1.batch.batch_id))
            .leftJoin(schema_1.batch_practical_access, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.batch_practical_access.batch_id, schema_1.batch.batch_id), (0, drizzle_orm_1.eq)(schema_1.batch_practical_access.practical_id, practicalId)))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courses_faculty.faculty_id, facultyId), (0, drizzle_orm_1.eq)(schema_1.courses_faculty.course_id, courseId), (0, drizzle_orm_1.eq)(schema_1.batch.batch_id, schema_1.courses_faculty.batch_id)))
            .orderBy(schema_1.batch.division, schema_1.batch.batch);
        return result;
    });
}
