import { db } from 'config/db';
import { courses_faculty, faculty, courses, batch } from 'models/schema';
import { eq, and } from 'drizzle-orm';
import { AppError } from '../utils/errors';

export async function assignCourseToFaculty(assignmentData: any) {
    const { course_id, faculty_id, batch_id } = assignmentData;
    // Check if the faculty exists and belongs to the same department as the course
    const facultyExists = await db.select().from(faculty).where(eq(faculty.faculty_id, faculty_id)).limit(1);
    if (facultyExists.length === 0) {
        throw new AppError(404, 'Faculty not found');
    }
    const courseExists = await db.select().from(courses).where(eq(courses.course_id, course_id)).limit(1);
    if (courseExists.length === 0) {
        throw new AppError(404, 'Course not found');
    }
    if (facultyExists[0].department_id !== courseExists[0].department_id) {
        throw new AppError(400, 'Faculty and course must belong to the same department');
    }
    const result = await db.insert(courses_faculty).values(assignmentData);
    return await db.select().from(courses_faculty)
        .where(
            and(
                eq(courses_faculty.course_id, course_id),
                eq(courses_faculty.batch_id, batch_id)))
        .limit(1);
}

export async function updateCourseFacultyAssignment(courseId: number, batchId: number, facultyId: number) {
    const result = await db.update(courses_faculty)
        .set({ faculty_id: facultyId })
        .where(and(
            eq(courses_faculty.course_id, courseId),
            eq(courses_faculty.batch_id, batchId)
        ));

    if (result[0].affectedRows === 0) {
        throw new AppError(404, 'Assignment not found');
    }

    return await db.select().from(courses_faculty)
        .where(and(
            eq(courses_faculty.course_id, courseId),
            eq(courses_faculty.batch_id, batchId)
        ))
        .limit(1);
}

export async function deleteCourseFacultyAssignment(courseId: number, batchId: number) {
    const result = await db.delete(courses_faculty)
        .where(and(
            eq(courses_faculty.course_id, courseId),
            eq(courses_faculty.batch_id, batchId)
        ));
    if (result[0].affectedRows === 0) {
        throw new AppError(404, 'Assignment not found');
    }
}

export async function getFacultyByCourse(courseId: number) {
    return await db.select({
        course_id: courses_faculty.course_id,
        faculty_id: courses_faculty.faculty_id,
        batch_id: courses_faculty.batch_id,
        // faculty_name: users.username,
        batch_name: batch.batch,
        division: batch.division
    })
        .from(courses_faculty)
        .innerJoin(faculty, eq(courses_faculty.faculty_id, faculty.faculty_id))
        .innerJoin(batch, eq(courses_faculty.batch_id, batch.batch_id))
        .where(eq(courses_faculty.course_id, courseId));
}

export async function getCoursesByFaculty(facultyId: number) {
    return await db.select().from(courses_faculty)
        .innerJoin(courses, eq(courses_faculty.course_id, courses.course_id))
        .where(eq(courses_faculty.faculty_id, facultyId));
}