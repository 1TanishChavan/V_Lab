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


export async function getStudentsWithFilters(filters: {
    department?: string;
    semester?: string;
    division?: string;
    batch?: string;
}) {
    try {
        let query = db
            .select({
                student_id: students.student_id,
                name: users.username,
                roll_id: students.roll_id,
                email: users.email,
                semester: batch.semester,
                division: batch.division,
                batch: batch.batch,
                department_name: departments.name,
            })
            .from(students)
            .innerJoin(users, eq(students.student_id, users.user_id))
            .innerJoin(batch, eq(students.batch_id, batch.batch_id))
            .innerJoin(departments, eq(batch.department_id, departments.department_id));

        if (filters.department) query = query.where(eq(departments.name, filters.department));
        if (filters.semester) query = query.where(eq(batch.semester, parseInt(filters.semester)));
        if (filters.division) query = query.where(eq(batch.division, filters.division));
        if (filters.batch) query = query.where(eq(batch.batch, filters.batch));

        return await query;
    } catch (error) {
        console.error('Error in getStudentsWithFilters:', error);
        throw new AppError(500, 'Failed to fetch students');
    }
}

export async function getDepartments() {
    try {
        return await db
            .select({
                id: departments.department_id,
                name: departments.name,
            })
            .from(departments);
    } catch (error) {
        console.error('Error in getDepartments:', error);
        throw new AppError(500, 'Failed to fetch departments');
    }
}

export async function getSemesters() {
    try {
        const result = await db
            .select({
                semester: courses.semester,
            })
            .from(courses)
            .groupBy(courses.semester)
            .orderBy(courses.semester);

        return result.map(row => row.semester);
    } catch (error) {
        console.error('Error in getSemesters:', error);
        throw new AppError(500, 'Failed to fetch semesters');
    }
}

export async function getDivisions() {
    try {
        const result = await db
            .select({
                division: batch.division,
            })
            .from(batch)
            .groupBy(batch.division)
            .orderBy(batch.division);

        return result.map(row => row.division);
    } catch (error) {
        console.error('Error in getDivisions:', error);
        throw new AppError(500, 'Failed to fetch divisions');
    }
}

export async function getBatches() {
    try {
        const result = await db
            .select({
                batch: batch.batch,
            })
            .from(batch)
            .groupBy(batch.batch)
            .orderBy(batch.batch);

        return result.map(row => row.batch);
    } catch (error) {
        console.error('Error in getBatches:', error);
        throw new AppError(500, 'Failed to fetch batches');
    }
}