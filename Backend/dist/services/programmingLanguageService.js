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
exports.getProgrammingLanguages = getProgrammingLanguages;
exports.createProgrammingLanguage = createProgrammingLanguage;
exports.updateProgrammingLanguage = updateProgrammingLanguage;
exports.deleteProgrammingLanguage = deleteProgrammingLanguage;
const db_1 = require("../config/db");
const schema_1 = require("../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const errors_1 = require("../utils/errors");
function getProgrammingLanguages() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield db_1.db.select({ "programming_language_id": schema_1.programming_language.programming_language_id, "language_name": schema_1.programming_language.language_name }).from(schema_1.programming_language);
    });
}
function createProgrammingLanguage(languageData) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield db_1.db.insert(schema_1.programming_language).values(languageData);
        return yield db_1.db.select().from(schema_1.programming_language).where((0, drizzle_orm_1.eq)(schema_1.programming_language.programming_language_id, result[0].insertId)).limit(1);
    });
}
function updateProgrammingLanguage(languageId, languageData) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db_1.db.update(schema_1.programming_language)
            .set(languageData)
            .where((0, drizzle_orm_1.eq)(schema_1.programming_language.programming_language_id, languageId));
        const updatedLanguage = yield db_1.db.select().from(schema_1.programming_language).where((0, drizzle_orm_1.eq)(schema_1.programming_language.programming_language_id, languageId)).limit(1);
        if (!updatedLanguage[0]) {
            throw new errors_1.AppError(404, 'Programming language not found');
        }
        return updatedLanguage[0];
    });
}
function deleteProgrammingLanguage(languageId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield db_1.db.delete(schema_1.programming_language)
            .where((0, drizzle_orm_1.eq)(schema_1.programming_language.programming_language_id, languageId));
        if (result[0].affectedRows === 0) {
            throw new errors_1.AppError(404, 'Programming language not found');
        }
    });
}
