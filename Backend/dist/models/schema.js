"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRelations = exports.submissionsRelations = exports.batchPracticalAccessRelations = exports.pracLanguageRelations = exports.pracIoRelations = exports.practicalsRelations = exports.coursesFacultyRelations = exports.coursesRelations = exports.facultyRelations = exports.studentsRelations = exports.batchRelations = exports.usersRelations = exports.departmentsRelations = exports.reports = exports.submissions = exports.batch_practical_access = exports.prac_language = exports.prac_io = exports.practicals = exports.courses_faculty = exports.courses = exports.faculty = exports.students = exports.batch = exports.users = exports.departments = exports.programming_language = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const dotenv_1 = __importDefault(require("dotenv"));
const drizzle_orm_2 = require("drizzle-orm");
dotenv_1.default.config();
exports.programming_language = (0, mysql_core_1.mysqlTable)('programming_language', {
    programming_language_id: (0, mysql_core_1.smallint)('programming_language').primaryKey().autoincrement(),
    language_name: (0, mysql_core_1.varchar)('language_name', { length: 40 }).notNull(),
}, (table) => ({
    languageNameIndex: (0, mysql_core_1.index)('language_name_idx').on(table.language_name),
}));
exports.departments = (0, mysql_core_1.mysqlTable)('departments', {
    department_id: (0, mysql_core_1.int)('department_id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 225 }).notNull(),
}, (table) => ({
    nameIndex: (0, mysql_core_1.index)('name_idx').on(table.name),
}));
exports.users = (0, mysql_core_1.mysqlTable)('users', {
    user_id: (0, mysql_core_1.int)('user_id').primaryKey().autoincrement(),
    username: (0, mysql_core_1.varchar)('username', { length: 225 }).notNull(),
    password: (0, mysql_core_1.varchar)('password', { length: 225 }).notNull(),
    email: (0, mysql_core_1.varchar)('email', { length: 225 }).notNull(),
    role: (0, mysql_core_1.mysqlEnum)('role', ['Student', 'Faculty', 'HOD', 'Admin']).notNull(),
}, (table) => ({
    usernameIndex: (0, mysql_core_1.index)('username_idx').on(table.username),
    emailIndex: (0, mysql_core_1.index)('email_idx').on(table.email),
    roleIndex: (0, mysql_core_1.index)('role_idx').on(table.role),
}));
exports.batch = (0, mysql_core_1.mysqlTable)('batch', {
    batch_id: (0, mysql_core_1.int)('batch_id').primaryKey().autoincrement(),
    department_id: (0, mysql_core_1.int)('department_id').notNull().references(() => exports.departments.department_id),
    semester: (0, mysql_core_1.tinyint)('semester').notNull(),
    division: (0, mysql_core_1.varchar)('division', { length: 2 }).notNull(),
    batch: (0, mysql_core_1.varchar)('batch', { length: 2 }).notNull(),
}, (table) => ({
    departmentIdIndex: (0, mysql_core_1.index)('department_id_idx').on(table.department_id),
    semesterIndex: (0, mysql_core_1.index)('semester_idx').on(table.semester),
    divisionIndex: (0, mysql_core_1.index)('division_idx').on(table.division),
    batchIndex: (0, mysql_core_1.index)('batch_idx').on(table.batch),
}));
exports.students = (0, mysql_core_1.mysqlTable)('students', {
    student_id: (0, mysql_core_1.int)('student_id').primaryKey().references(() => exports.users.user_id),
    batch_id: (0, mysql_core_1.int)('batch_id').notNull().references(() => exports.batch.batch_id),
    roll_id: (0, mysql_core_1.varchar)('roll_id', { length: 20 }).notNull(),
}, (table) => ({
    batchIdIndex: (0, mysql_core_1.index)('batch_id_idx').on(table.batch_id),
}));
exports.faculty = (0, mysql_core_1.mysqlTable)('faculty', {
    faculty_id: (0, mysql_core_1.int)('faculty_id').primaryKey().references(() => exports.users.user_id),
    department_id: (0, mysql_core_1.int)('department_id').notNull().references(() => exports.departments.department_id),
}, (table) => ({
    departmentIdIndex: (0, mysql_core_1.index)('department_id_idx').on(table.department_id),
}));
exports.courses = (0, mysql_core_1.mysqlTable)('courses', {
    course_id: (0, mysql_core_1.int)('course_id').primaryKey().autoincrement(),
    course_name: (0, mysql_core_1.varchar)('course_name', { length: 225 }).notNull(),
    course_code: (0, mysql_core_1.varchar)('course_code', { length: 225 }).notNull(),
    semester: (0, mysql_core_1.tinyint)('semester').notNull(),
    department_id: (0, mysql_core_1.int)('department_id').notNull().references(() => exports.departments.department_id),
}, (table) => ({
    courseNameIndex: (0, mysql_core_1.index)('course_name_idx').on(table.course_name),
    semesterIndex: (0, mysql_core_1.index)('semester_idx').on(table.semester),
    departmentIdIndex: (0, mysql_core_1.index)('department_id_idx').on(table.department_id),
}));
exports.courses_faculty = (0, mysql_core_1.mysqlTable)('courses_faculty', {
    course_id: (0, mysql_core_1.int)('course_id').notNull().references(() => exports.courses.course_id),
    faculty_id: (0, mysql_core_1.int)('faculty_id').notNull().references(() => exports.faculty.faculty_id),
    batch_id: (0, mysql_core_1.int)('batch_id').notNull().references(() => exports.batch.batch_id),
}, (table) => ({
    pk: (0, mysql_core_1.primaryKey)({ columns: [table.course_id, table.faculty_id, table.batch_id] }),
    courseIdIndex: (0, mysql_core_1.index)('course_id_idx').on(table.course_id),
    facultyIdIndex: (0, mysql_core_1.index)('faculty_id_idx').on(table.faculty_id),
    batchIdIndex: (0, mysql_core_1.index)('batch_id_idx').on(table.batch_id),
}));
exports.practicals = (0, mysql_core_1.mysqlTable)('practicals', {
    practical_id: (0, mysql_core_1.int)('practical_id').primaryKey().autoincrement(),
    sr_no: (0, mysql_core_1.int)('sr_no').notNull(),
    practical_name: (0, mysql_core_1.varchar)('practical_name', { length: 225 }).notNull(),
    course_id: (0, mysql_core_1.int)('course_id')
        .notNull()
        .references(() => exports.courses.course_id, { onDelete: 'cascade' }),
    description: (0, mysql_core_1.text)('description').notNull(),
    pdf_url: (0, mysql_core_1.varchar)('pdf_url', { length: 255 }),
}, (table) => ({
    practicalNameIndex: (0, mysql_core_1.index)('practical_name_idx').on(table.practical_name),
    courseIdIndex: (0, mysql_core_1.index)('course_id_idx').on(table.course_id),
}));
exports.prac_io = (0, mysql_core_1.mysqlTable)('prac_io', {
    prac_io_id: (0, mysql_core_1.int)('prac_io_id').primaryKey().autoincrement(),
    practical_id: (0, mysql_core_1.int)('practical_id')
        .notNull()
        .references(() => exports.practicals.practical_id, { onDelete: 'cascade' }),
    input: (0, mysql_core_1.text)('input').notNull(),
    output: (0, mysql_core_1.text)('output').notNull(),
    isPublic: (0, mysql_core_1.boolean)('is_public').notNull().default(false),
}, (table) => ({
    practicalIdIndex: (0, mysql_core_1.index)('practical_id_idx').on(table.practical_id),
    isPublicIndex: (0, mysql_core_1.index)('is_public_idx').on(table.isPublic),
}));
exports.prac_language = (0, mysql_core_1.mysqlTable)('prac_language', {
    prac_language_id: (0, mysql_core_1.int)('prac_language_id').primaryKey().autoincrement(),
    practical_id: (0, mysql_core_1.int)('practical_id')
        .notNull()
        .references(() => exports.practicals.practical_id, { onDelete: 'cascade' }),
    programming_language_id: (0, mysql_core_1.smallint)('programming_language_id')
        .notNull()
        .references(() => exports.programming_language.programming_language_id)
}, (table) => ({}));
exports.batch_practical_access = (0, mysql_core_1.mysqlTable)('batch_practical_access', {
    batch_practical_access_id: (0, mysql_core_1.int)('batch_practical_access_id').primaryKey().autoincrement(),
    practical_id: (0, mysql_core_1.int)('practical_id')
        .notNull()
        .references(() => exports.practicals.practical_id, { onDelete: 'cascade' }),
    batch_id: (0, mysql_core_1.int)('batch_id')
        .notNull()
        .references(() => exports.batch.batch_id),
    lock: (0, mysql_core_1.boolean)('lock').notNull(),
    deadline: (0, mysql_core_1.datetime)('deadline'),
}, (table) => ({
    practicalIdIndex: (0, mysql_core_1.index)('practical_id_idx').on(table.practical_id),
    batchIdIndex: (0, mysql_core_1.index)('batch_id_idx').on(table.batch_id),
    lockIndex: (0, mysql_core_1.index)('lock_idx').on(table.lock),
    deadlineIndex: (0, mysql_core_1.index)('deadline_idx').on(table.deadline),
}));
exports.submissions = (0, mysql_core_1.mysqlTable)('submissions', {
    submission_id: (0, mysql_core_1.int)('submission_id').primaryKey().autoincrement(),
    practical_id: (0, mysql_core_1.int)('practical_id')
        .notNull()
        .references(() => exports.practicals.practical_id, { onDelete: 'cascade' }),
    student_id: (0, mysql_core_1.int)('student_id')
        .notNull()
        .references(() => exports.students.student_id),
    code_submitted: (0, mysql_core_1.text)('code_submitted').notNull(),
    status: (0, mysql_core_1.mysqlEnum)('status', ['Accepted', 'Rejected', 'Pending']).notNull().default('Pending'),
    marks: (0, mysql_core_1.int)('marks').default(0),
    submission_time: (0, mysql_core_1.datetime)('submission_time').default((0, drizzle_orm_2.sql) `now(3)`),
}, (table) => ({
    practicalIndex: (0, mysql_core_1.index)('practical_idx').on(table.practical_id),
    studentIndex: (0, mysql_core_1.index)('student_idx').on(table.student_id),
}));
exports.reports = (0, mysql_core_1.mysqlTable)('reports', {
    report_id: (0, mysql_core_1.int)('report_id').primaryKey().autoincrement(),
    report_name: (0, mysql_core_1.text)('report_name').notNull(),
    student_id: (0, mysql_core_1.int)('student_id').notNull().references(() => exports.users.user_id),
    generated_at: (0, mysql_core_1.datetime)('generated_at').notNull(),
    report_data: (0, mysql_core_1.json)('report_data').notNull(),
}, (table) => ({
    studentIdIndex: (0, mysql_core_1.index)('student_id_idx').on(table.student_id),
    generatedAtIndex: (0, mysql_core_1.index)('generated_at_idx').on(table.generated_at),
}));
exports.departmentsRelations = (0, drizzle_orm_1.relations)(exports.departments, ({ many }) => ({
    faculty: many(exports.faculty),
    courses: many(exports.courses),
    batches: many(exports.batch),
}));
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ one }) => ({
    student: one(exports.students, {
        fields: [exports.users.user_id],
        references: [exports.students.student_id],
    }),
    faculty: one(exports.faculty, {
        fields: [exports.users.user_id],
        references: [exports.faculty.faculty_id],
    }),
}));
exports.batchRelations = (0, drizzle_orm_1.relations)(exports.batch, ({ one, many }) => ({
    department: one(exports.departments, {
        fields: [exports.batch.department_id],
        references: [exports.departments.department_id],
    }),
    students: many(exports.students),
    coursesFaculty: many(exports.courses_faculty),
}));
exports.studentsRelations = (0, drizzle_orm_1.relations)(exports.students, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.students.student_id],
        references: [exports.users.user_id],
    }),
    batch: one(exports.batch, {
        fields: [exports.students.batch_id],
        references: [exports.batch.batch_id],
    }),
}));
exports.facultyRelations = (0, drizzle_orm_1.relations)(exports.faculty, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.faculty.faculty_id],
        references: [exports.users.user_id],
    }),
    department: one(exports.departments, {
        fields: [exports.faculty.department_id],
        references: [exports.departments.department_id],
    }),
    coursesFaculty: many(exports.courses_faculty),
}));
exports.coursesRelations = (0, drizzle_orm_1.relations)(exports.courses, ({ many, one }) => ({
    department: one(exports.departments, {
        fields: [exports.courses.department_id],
        references: [exports.departments.department_id],
    }),
    faculty: many(exports.courses_faculty),
    practicals: many(exports.practicals),
}));
exports.coursesFacultyRelations = (0, drizzle_orm_1.relations)(exports.courses_faculty, ({ one }) => ({
    course: one(exports.courses, {
        fields: [exports.courses_faculty.course_id],
        references: [exports.courses.course_id],
    }),
    faculty: one(exports.faculty, {
        fields: [exports.courses_faculty.faculty_id],
        references: [exports.faculty.faculty_id],
    }),
    batch: one(exports.batch, {
        fields: [exports.courses_faculty.batch_id],
        references: [exports.batch.batch_id],
    }),
}));
exports.practicalsRelations = (0, drizzle_orm_1.relations)(exports.practicals, ({ one, many }) => ({
    course: one(exports.courses, {
        fields: [exports.practicals.course_id],
        references: [exports.courses.course_id],
    }),
    pracIo: many(exports.prac_io),
    pracLanguage: many(exports.prac_language),
    batchPracticalAccess: many(exports.batch_practical_access),
    submissions: many(exports.submissions),
}));
exports.pracIoRelations = (0, drizzle_orm_1.relations)(exports.prac_io, ({ one }) => ({
    practical: one(exports.practicals, {
        fields: [exports.prac_io.practical_id],
        references: [exports.practicals.practical_id],
    }),
}));
exports.pracLanguageRelations = (0, drizzle_orm_1.relations)(exports.prac_language, ({ one }) => ({
    practical: one(exports.practicals, {
        fields: [exports.prac_language.practical_id],
        references: [exports.practicals.practical_id],
    }),
    programmingLanguage: one(exports.programming_language, {
        fields: [exports.prac_language.programming_language_id],
        references: [exports.programming_language.programming_language_id],
    }),
}));
exports.batchPracticalAccessRelations = (0, drizzle_orm_1.relations)(exports.batch_practical_access, ({ one }) => ({
    practical: one(exports.practicals, {
        fields: [exports.batch_practical_access.practical_id],
        references: [exports.practicals.practical_id],
    }),
    batch: one(exports.batch, {
        fields: [exports.batch_practical_access.batch_id],
        references: [exports.batch.batch_id],
    }),
}));
exports.submissionsRelations = (0, drizzle_orm_1.relations)(exports.submissions, ({ one }) => ({
    practical: one(exports.practicals, {
        fields: [exports.submissions.practical_id],
        references: [exports.practicals.practical_id],
    }),
    student: one(exports.students, {
        fields: [exports.submissions.student_id],
        references: [exports.students.student_id],
    }),
}));
exports.reportsRelations = (0, drizzle_orm_1.relations)(exports.reports, ({ one }) => ({
    student: one(exports.students, {
        fields: [exports.reports.student_id],
        references: [exports.students.student_id],
    }),
}));
