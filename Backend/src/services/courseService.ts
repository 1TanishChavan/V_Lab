import { db } from './../config/db';
import { courses, departments } from './../models/schema';
import { eq, and } from 'drizzle-orm';
import { AppError } from './../utils/errors';

export async function getAllCourses() {
    return await db.select().from(courses);
}

export async function createCourse(courseData: any) {
    // Ensure department_id is present 
    if (!courseData.department_id) {
        throw new AppError(400, 'Department ID is required to create a course');
    }

    const result = await db.insert(courses).values(courseData);
    return await db.select().from(courses).where(eq(courses.course_id, result[0].insertId)).limit(1);
}

export async function updateCourse(id: number, courseData: any, authorizedDepartmentId?: number) {
    const course = await db.select().from(courses).where(eq(courses.course_id, id)).limit(1);

    if (!course[0]) {
        throw new AppError(404, 'Course not found');
    }

    // FIX: If authorizedDepartmentId is provided (HOD), check ownership
    if (authorizedDepartmentId && course[0].department_id !== authorizedDepartmentId) {
        throw new AppError(403, 'You can only update courses from your department');
    }

    await db.update(courses)
        .set(courseData)
        .where(eq(courses.course_id, id));

    return await db.select().from(courses).where(eq(courses.course_id, id)).limit(1);
}

export async function deleteCourse(id: number, authorizedDepartmentId?: number) {
    const course = await db.select().from(courses).where(eq(courses.course_id, id)).limit(1);

    if (!course[0]) {
        throw new AppError(404, 'Course not found');
    }

    // FIX: If authorizedDepartmentId is provided (HOD), check ownership
    if (authorizedDepartmentId && course[0].department_id !== authorizedDepartmentId) {
        throw new AppError(403, 'You can only delete courses from your department');
    }

    await db.delete(courses).where(eq(courses.course_id, id));
}

export async function getCoursesBySemesterAndDepartment(semester: number, departmentId: number) {
    return await db.select()
        .from(courses)
        .where(
            and(
                eq(courses.semester, semester),
                eq(courses.department_id, departmentId)
            )
        );
}

export async function getCoursesByDepartment(departmentId: number) {
    return await db.select()
        .from(courses)
        .where(
            eq(courses.department_id, departmentId)
        );
}

export async function getCoursesById(courseId: number) {
    return await db
        .select({
            course_id: courses.course_id,
            course_name: courses.course_name,
            course_code: courses.course_code,
            semester: courses.semester,
            department_id: courses.department_id,
            department_name: departments.name,
        })
        .from(courses)
        .innerJoin(
            departments,
            eq(courses.department_id, departments.department_id)
        )
        .where(
            eq(courses.course_id, courseId)
        )
        .limit(1);
}