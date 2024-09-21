import { db } from 'config/db';
import { submissions, practicals, students, users, prac_io, prac_language, courses, batch_practical_access, batch, courses_faculty, departments } from '../models/schema';
import { eq } from 'drizzle-orm';

import { AppError } from '../utils/errors';
export async function getStudentSubmissions(studentId: number) {
    try {
        const studentSubmissions = await db
            .select({
                submission_id: submissions.submission_id,
                practical_id: submissions.practical_id,
                practical_sr_no: practicals.sr_no,
                practical_name: practicals.practical_name,
                course_name: courses.course_name,
                submission_time: submissions.submission_time,
                status: submissions.status,
                marks: submissions.marks,
            })
            .from(submissions)
            .innerJoin(practicals, eq(submissions.practical_id, practicals.practical_id))
            .innerJoin(courses, eq(practicals.course_id, courses.course_id))
            .where(eq(submissions.student_id, studentId));

        return studentSubmissions;
    } catch (error) {
        console.error('Error in getStudentSubmissions:', error);
        throw new AppError(500, 'Failed to fetch student submissions');
    }
}

export async function getStudentsWithDepartment() {
    return await db.select({
        user_id: users.user_id,
        username: users.username,
        email: users.email,
        department_name: departments.name,
        semester: students.semester,
        batch: students.batch,
        roll_id: students.roll_id,
        division: students.division
    })
        .from(users)
        .innerJoin(students, eq(users.user_id, students.student_id))
        .innerJoin(departments, eq(users.department_id, departments.department_id))
        .where(eq(users.role, 'Student'));
}