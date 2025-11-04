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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPractical = createPractical;
exports.deletePractical = deletePractical;
exports.getPracticals = getPracticals;
exports.getPracticalById = getPracticalById;
exports.getPracticalByCourse = getPracticalByCourse;
exports.updatePractical = updatePractical;
exports.checkFacultyPracticalPermission = checkFacultyPracticalPermission;
exports.getPracticalTestCases = getPracticalTestCases;
exports.getPracticalLanguages = getPracticalLanguages;
const db_1 = require("./../config/db");
const schema_1 = require("./../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const errors_1 = require("./../utils/errors");
function createPractical(practicalData) {
    return __awaiter(this, void 0, void 0, function* () {
        const { prac_io: pracIoData, prac_language: pracLanguageData } = practicalData, practicalInfo = __rest(practicalData, ["prac_io", "prac_language"]);
        yield db_1.db.transaction((tx) => __awaiter(this, void 0, void 0, function* () {
            const result = yield tx.insert(schema_1.practicals).values(practicalInfo);
            const newPractical = yield tx.select().from(schema_1.practicals).where((0, drizzle_orm_1.eq)(schema_1.practicals.practical_id, result[0].insertId)).limit(1);
            if (pracIoData) {
                for (const io of pracIoData) {
                    yield tx.insert(schema_1.prac_io).values(Object.assign(Object.assign({}, io), { practical_id: newPractical[0].practical_id }));
                }
            }
            if (pracLanguageData) {
                for (const lang of pracLanguageData) {
                    yield tx.insert(schema_1.prac_language).values(Object.assign(Object.assign({}, lang), { practical_id: newPractical[0].practical_id }));
                }
            }
            return newPractical[0];
        }));
    });
}
function deletePractical(practicalId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield db_1.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield trx.delete(schema_1.prac_io).where((0, drizzle_orm_1.eq)(schema_1.prac_io.practical_id, practicalId));
                yield trx.delete(schema_1.prac_language).where((0, drizzle_orm_1.eq)(schema_1.prac_language.practical_id, practicalId));
                const result = yield trx.delete(schema_1.practicals).where((0, drizzle_orm_1.eq)(schema_1.practicals.practical_id, practicalId));
                if (result[0].affectedRows === 0) {
                    throw new errors_1.AppError(404, 'Practical not found');
                }
            }
            catch (error) {
                console.error('Error in deletePractical:', error);
                if (error instanceof errors_1.AppError) {
                    throw error;
                }
                throw new errors_1.AppError(500, 'Failed to delete practical');
            }
        }));
    });
}
function getPracticals() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield db_1.db.select().from(schema_1.practicals);
        }
        catch (error) {
            console.error('Error in getPracticals:', error);
            throw new errors_1.AppError(500, 'Failed to fetch practicals');
        }
    });
}
function getPracticalById(practicalId) {
    return __awaiter(this, void 0, void 0, function* () {
        const practical = yield db_1.db.select(Object.assign(Object.assign({}, schema_1.practicals), { course_name: schema_1.courses.course_name, semester: schema_1.courses.semester }))
            .from(schema_1.practicals)
            .where((0, drizzle_orm_1.eq)(schema_1.practicals.practical_id, practicalId))
            .innerJoin(schema_1.courses, (0, drizzle_orm_1.eq)(schema_1.courses.course_id, schema_1.practicals.course_id))
            .limit(1);
        if (!practical[0]) {
            return null;
        }
        const pracIo = yield db_1.db.select().from(schema_1.prac_io).where((0, drizzle_orm_1.eq)(schema_1.prac_io.practical_id, practicalId));
        const pracLanguage = yield db_1.db.select().from(schema_1.prac_language).where((0, drizzle_orm_1.eq)(schema_1.prac_language.practical_id, practicalId));
        return Object.assign(Object.assign({}, practical[0]), { prac_io: pracIo, prac_language: pracLanguage });
    });
}
function getPracticalByCourse(courseId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield db_1.db.select(Object.assign(Object.assign({}, schema_1.practicals), { department_name: schema_1.departments.name }))
                .from(schema_1.practicals)
                .innerJoin(schema_1.courses, (0, drizzle_orm_1.eq)(schema_1.practicals.course_id, schema_1.courses.course_id))
                .innerJoin(schema_1.departments, (0, drizzle_orm_1.eq)(schema_1.courses.department_id, schema_1.departments.department_id))
                .where((0, drizzle_orm_1.eq)(schema_1.practicals.course_id, courseId))
                .orderBy(schema_1.practicals.sr_no);
        }
        catch (error) {
            console.error('Error in getPracticalByCourse:', error);
            throw new errors_1.AppError(500, 'Failed to fetch practicals for the course');
        }
    });
}
function updatePractical(practicalId, practicalData) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield db_1.db.transaction((tx) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { prac_io: pracIoData, prac_language: pracLanguageData } = practicalData, practicalInfo = __rest(practicalData, ["prac_io", "prac_language"]);
                yield tx
                    .update(schema_1.practicals)
                    .set({
                    sr_no: practicalInfo.sr_no,
                    practical_name: practicalInfo.practical_name,
                    description: practicalInfo.description,
                    pdf_url: practicalInfo.pdf_url || null,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.practicals.practical_id, practicalId));
                if (pracIoData && Array.isArray(pracIoData)) {
                    yield tx
                        .delete(schema_1.prac_io)
                        .where((0, drizzle_orm_1.eq)(schema_1.prac_io.practical_id, practicalId));
                    for (const io of pracIoData) {
                        yield tx.insert(schema_1.prac_io).values({
                            practical_id: practicalId,
                            input: io.input,
                            output: io.output,
                            isPublic: io.isPublic
                        });
                    }
                }
                if (pracLanguageData && Array.isArray(pracLanguageData)) {
                    yield tx
                        .delete(schema_1.prac_language)
                        .where((0, drizzle_orm_1.eq)(schema_1.prac_language.practical_id, practicalId));
                    for (const lang of pracLanguageData) {
                        yield tx.insert(schema_1.prac_language).values({
                            practical_id: practicalId,
                            programming_language_id: lang.programming_language_id
                        });
                    }
                }
                const updatedPractical = yield tx
                    .select(Object.assign(Object.assign({}, schema_1.practicals), { course_name: schema_1.courses.course_name, semester: schema_1.courses.semester }))
                    .from(schema_1.practicals)
                    .innerJoin(schema_1.courses, (0, drizzle_orm_1.eq)(schema_1.courses.course_id, schema_1.practicals.course_id))
                    .where((0, drizzle_orm_1.eq)(schema_1.practicals.practical_id, practicalId))
                    .limit(1);
                if (!updatedPractical[0]) {
                    throw new errors_1.AppError(404, 'Updated practical not found');
                }
                const testCases = yield tx
                    .select()
                    .from(schema_1.prac_io)
                    .where((0, drizzle_orm_1.eq)(schema_1.prac_io.practical_id, practicalId));
                const languages = yield tx
                    .select({
                    programming_language_id: schema_1.programming_language.programming_language_id,
                    language_name: schema_1.programming_language.language_name
                })
                    .from(schema_1.prac_language)
                    .innerJoin(schema_1.programming_language, (0, drizzle_orm_1.eq)(schema_1.prac_language.programming_language_id, schema_1.programming_language.programming_language_id))
                    .where((0, drizzle_orm_1.eq)(schema_1.prac_language.practical_id, practicalId));
                return Object.assign(Object.assign({}, updatedPractical[0]), { prac_io: testCases, prac_language: languages });
            }
            catch (error) {
                console.error('Error in updatePractical:', error);
                if (error instanceof errors_1.AppError) {
                    throw error;
                }
                throw new errors_1.AppError(500, 'Failed to update practical');
            }
        }));
    });
}
function checkFacultyPracticalPermission(facultyId, courseId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield db_1.db
                .select()
                .from(schema_1.courses_faculty)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.courses_faculty.faculty_id, facultyId), (0, drizzle_orm_1.eq)(schema_1.courses_faculty.course_id, courseId)))
                .limit(1);
            return result.length > 0;
        }
        catch (error) {
            console.error('Error in checkFacultyPracticalPermission:', error);
            throw new errors_1.AppError(500, 'Failed to check faculty permission');
        }
    });
}
function getPracticalTestCases(practicalId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield db_1.db
                .select()
                .from(schema_1.prac_io)
                .where((0, drizzle_orm_1.eq)(schema_1.prac_io.practical_id, practicalId));
        }
        catch (error) {
            console.error('Error in getPracticalTestCases:', error);
            throw new errors_1.AppError(500, 'Failed to fetch practical test cases');
        }
    });
}
function getPracticalLanguages(practicalId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield db_1.db
                .select({
                programming_language_id: schema_1.programming_language.programming_language_id,
                language_name: schema_1.programming_language.language_name
            })
                .from(schema_1.prac_language)
                .innerJoin(schema_1.programming_language, (0, drizzle_orm_1.eq)(schema_1.prac_language.programming_language_id, schema_1.programming_language.programming_language_id))
                .where((0, drizzle_orm_1.eq)(schema_1.prac_language.practical_id, practicalId));
        }
        catch (error) {
            console.error('Error in getPracticalLanguages:', error);
            throw new errors_1.AppError(500, 'Failed to fetch practical languages');
        }
    });
}
