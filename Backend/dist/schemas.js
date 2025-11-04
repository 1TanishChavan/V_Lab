"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectStudentWithBatchSchema = exports.selectPracticalWithDetailsSchema = exports.selectCourseWithFacultySchema = exports.selectCourseFacultySchema = exports.selectReportSchema = exports.selectSubmissionSchema = exports.selectPracLanguageSchema = exports.selectPracIOSchema = exports.selectProgrammingLanguageSchema = exports.selectFacultySchema = exports.selectStudentSchema = exports.selectBatchPracticalAccessSchema = exports.selectPracticalSchema = exports.selectCourseSchema = exports.selectBatchSchema = exports.selectDepartmentSchema = exports.selectUserSchema = exports.updateReportSchema = exports.insertReportSchema = exports.updateSubmissionSchema = exports.insertSubmissionSchema = exports.updateCourseFacultySchema = exports.insertCourseFacultySchema = exports.updateProgrammingLanguageSchema = exports.insertProgrammingLanguageSchema = exports.updateFacultySchema = exports.insertFacultySchema = exports.updateStudentSchema = exports.insertStudentSchema = exports.updateBatchPracticalAccessSchema = exports.insertBatchPracticalAccessSchema = exports.updatePracticalSchema = exports.insertPracticalSchema = exports.updateCourseSchema = exports.insertCourseSchema = exports.updateBatchSchema = exports.insertBatchSchema = exports.updateDepartmentSchema = exports.insertDepartmentSchema = exports.loginSchema = exports.updateUserSchema = exports.insertUserSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
exports.insertUserSchema = typebox_1.Type.Object({
    username: typebox_1.Type.String(),
    password: typebox_1.Type.String(),
    email: typebox_1.Type.String({ format: 'email' }),
    role: typebox_1.Type.Union([
        typebox_1.Type.Literal('Student'),
        typebox_1.Type.Literal('Faculty'),
        typebox_1.Type.Literal('HOD'),
        typebox_1.Type.Literal('Admin')
    ]),
    photo_url: typebox_1.Type.Optional(typebox_1.Type.String({ format: 'uri' })),
    department_id: typebox_1.Type.Optional(typebox_1.Type.Number()),
    batch_id: typebox_1.Type.Optional(typebox_1.Type.Number()),
    roll_id: typebox_1.Type.Optional(typebox_1.Type.String())
});
exports.updateUserSchema = typebox_1.Type.Partial(exports.insertUserSchema);
exports.loginSchema = typebox_1.Type.Object({
    email: typebox_1.Type.String({ format: 'email' }),
    password: typebox_1.Type.String()
});
exports.insertDepartmentSchema = typebox_1.Type.Object({
    name: typebox_1.Type.String()
});
exports.updateDepartmentSchema = typebox_1.Type.Partial(exports.insertDepartmentSchema);
exports.insertBatchSchema = typebox_1.Type.Object({
    department_id: typebox_1.Type.Number(),
    semester: typebox_1.Type.Number(),
    division: typebox_1.Type.String(),
    batch: typebox_1.Type.String()
});
exports.updateBatchSchema = typebox_1.Type.Partial(exports.insertBatchSchema);
exports.insertCourseSchema = typebox_1.Type.Object({
    course_name: typebox_1.Type.String(),
    course_code: typebox_1.Type.String(),
    semester: typebox_1.Type.Number(),
    department_id: typebox_1.Type.Number()
});
exports.updateCourseSchema = typebox_1.Type.Partial(exports.insertCourseSchema);
exports.insertPracticalSchema = typebox_1.Type.Object({
    sr_no: typebox_1.Type.Number(),
    practical_name: typebox_1.Type.String(),
    course_id: typebox_1.Type.Number(),
    description: typebox_1.Type.String(),
    prac_io: typebox_1.Type.Array(typebox_1.Type.Object({
        input: typebox_1.Type.String(),
        output: typebox_1.Type.String(),
        isPublic: typebox_1.Type.Boolean()
    })),
    prac_language: typebox_1.Type.Array(typebox_1.Type.Object({
        programming_language_id: typebox_1.Type.Number()
    }))
});
exports.updatePracticalSchema = typebox_1.Type.Partial(exports.insertPracticalSchema);
exports.insertBatchPracticalAccessSchema = typebox_1.Type.Object({
    practical_id: typebox_1.Type.Number(),
    batch_id: typebox_1.Type.Number(),
    lock: typebox_1.Type.Boolean(),
    deadline: typebox_1.Type.String({ format: 'date-time' })
});
exports.updateBatchPracticalAccessSchema = typebox_1.Type.Partial(exports.insertBatchPracticalAccessSchema);
exports.insertStudentSchema = typebox_1.Type.Intersect([
    exports.insertUserSchema,
    typebox_1.Type.Object({
        batch_id: typebox_1.Type.Number(),
        roll_id: typebox_1.Type.String()
    })
]);
exports.updateStudentSchema = typebox_1.Type.Partial(exports.insertStudentSchema);
exports.insertFacultySchema = typebox_1.Type.Intersect([
    exports.insertUserSchema,
    typebox_1.Type.Object({
        department_id: typebox_1.Type.Number()
    })
]);
exports.updateFacultySchema = typebox_1.Type.Partial(exports.insertFacultySchema);
exports.insertProgrammingLanguageSchema = typebox_1.Type.Object({
    language_name: typebox_1.Type.String()
});
exports.updateProgrammingLanguageSchema = typebox_1.Type.Partial(exports.insertProgrammingLanguageSchema);
exports.insertCourseFacultySchema = typebox_1.Type.Object({
    course_id: typebox_1.Type.Number(),
    faculty_id: typebox_1.Type.Number(),
    batch_id: typebox_1.Type.Number()
});
exports.updateCourseFacultySchema = typebox_1.Type.Partial(exports.insertCourseFacultySchema);
exports.insertSubmissionSchema = typebox_1.Type.Object({
    practical_id: typebox_1.Type.Number(),
    student_id: typebox_1.Type.Number(),
    submission_time: typebox_1.Type.String({ format: 'date-time' }),
    code_submitted: typebox_1.Type.String()
});
exports.updateSubmissionSchema = typebox_1.Type.Partial(exports.insertSubmissionSchema);
exports.insertReportSchema = typebox_1.Type.Object({
    report_name: typebox_1.Type.String(),
    student_id: typebox_1.Type.Number(),
    generated_at: typebox_1.Type.String({ format: 'date-time' }),
    report_data: typebox_1.Type.Any()
});
exports.updateReportSchema = typebox_1.Type.Partial(exports.insertReportSchema);
exports.selectUserSchema = typebox_1.Type.Object({
    user_id: typebox_1.Type.Number(),
    username: typebox_1.Type.String(),
    email: typebox_1.Type.String({ format: 'email' }),
    role: typebox_1.Type.Union([
        typebox_1.Type.Literal('Student'),
        typebox_1.Type.Literal('Faculty'),
        typebox_1.Type.Literal('HOD'),
        typebox_1.Type.Literal('Admin')
    ]),
    photo_url: typebox_1.Type.Optional(typebox_1.Type.String({ format: 'uri' }))
});
exports.selectDepartmentSchema = typebox_1.Type.Object({
    department_id: typebox_1.Type.Number(),
    name: typebox_1.Type.String()
});
exports.selectBatchSchema = typebox_1.Type.Object({
    batch_id: typebox_1.Type.Number(),
    department_id: typebox_1.Type.Number(),
    semester: typebox_1.Type.Number(),
    division: typebox_1.Type.String(),
    batch: typebox_1.Type.String()
});
exports.selectCourseSchema = typebox_1.Type.Object({
    course_id: typebox_1.Type.Number(),
    course_name: typebox_1.Type.String(),
    course_code: typebox_1.Type.String(),
    semester: typebox_1.Type.Number(),
    department_id: typebox_1.Type.Number()
});
exports.selectPracticalSchema = typebox_1.Type.Object({
    practical_id: typebox_1.Type.Number(),
    practical_name: typebox_1.Type.String(),
    course_id: typebox_1.Type.Number(),
    description: typebox_1.Type.String(),
    pdf_url: typebox_1.Type.Optional(typebox_1.Type.String({ format: 'uri' }))
});
exports.selectBatchPracticalAccessSchema = typebox_1.Type.Object({
    batch_practical_access_id: typebox_1.Type.Number(),
    practical_id: typebox_1.Type.Number(),
    batch_id: typebox_1.Type.Number(),
    lock: typebox_1.Type.Boolean(),
    deadline: typebox_1.Type.String({ format: 'date-time' })
});
exports.selectStudentSchema = typebox_1.Type.Intersect([
    exports.selectUserSchema,
    typebox_1.Type.Object({
        batch_id: typebox_1.Type.Number(),
        roll_id: typebox_1.Type.String()
    })
]);
exports.selectFacultySchema = typebox_1.Type.Intersect([
    exports.selectUserSchema,
    typebox_1.Type.Object({
        department_id: typebox_1.Type.Number()
    })
]);
exports.selectProgrammingLanguageSchema = typebox_1.Type.Object({
    programming_language_id: typebox_1.Type.Number(),
    language_name: typebox_1.Type.String()
});
exports.selectPracIOSchema = typebox_1.Type.Object({
    prac_io_id: typebox_1.Type.Number(),
    practical_id: typebox_1.Type.Number(),
    input: typebox_1.Type.String(),
    output: typebox_1.Type.String(),
    isPublic: typebox_1.Type.Boolean()
});
exports.selectPracLanguageSchema = typebox_1.Type.Object({
    prac_language_id: typebox_1.Type.Number(),
    practical_id: typebox_1.Type.Number(),
    programming_language_id: typebox_1.Type.Number()
});
exports.selectSubmissionSchema = typebox_1.Type.Object({
    submission_id: typebox_1.Type.Number(),
    practical_id: typebox_1.Type.Number(),
    student_id: typebox_1.Type.Number(),
    submission_time: typebox_1.Type.String({ format: 'date-time' }),
    code_submitted: typebox_1.Type.String()
});
exports.selectReportSchema = typebox_1.Type.Object({
    report_id: typebox_1.Type.Number(),
    report_name: typebox_1.Type.String(),
    student_id: typebox_1.Type.Number(),
    generated_at: typebox_1.Type.String({ format: 'date-time' }),
    report_data: typebox_1.Type.Any()
});
exports.selectCourseFacultySchema = typebox_1.Type.Object({
    course_id: typebox_1.Type.Number(),
    faculty_id: typebox_1.Type.Number(),
    batch_id: typebox_1.Type.Number()
});
exports.selectCourseWithFacultySchema = typebox_1.Type.Object(Object.assign(Object.assign({}, exports.selectCourseSchema.properties), { faculty: typebox_1.Type.Array(exports.selectFacultySchema) }));
exports.selectPracticalWithDetailsSchema = typebox_1.Type.Object(Object.assign(Object.assign({}, exports.selectPracticalSchema.properties), { prac_io: typebox_1.Type.Array(exports.selectPracIOSchema), prac_language: typebox_1.Type.Array(exports.selectPracLanguageSchema) }));
exports.selectStudentWithBatchSchema = typebox_1.Type.Object(Object.assign(Object.assign({}, exports.selectStudentSchema.properties), { batch: exports.selectBatchSchema }));
