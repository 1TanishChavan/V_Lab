import { db } from 'config/db';
import { users, courses_faculty, faculty, batch } from 'models/schema';
import { eq, or } from 'drizzle-orm';
import { AppError } from '../utils/errors';

export async function getFacultyByDepartment(departmentId: number) {
    return await db.select().from(users)
        .innerJoin(faculty, eq(users.user_id, faculty.faculty_id))
        .where(eq(faculty.department_id, departmentId));
}

export async function getAllFaculty() {
    return await db.select({
        user_id: faculty.faculty_id,
        department_id: faculty.department_id,
        username: users.username,
    }).from(users)
        .innerJoin(faculty, eq(users.user_id, faculty.faculty_id))
}

export async function getFacultyBatches(facultyId: number) {
    try {
        const facultyBatches = await db
            .select({
                batch_id: batch.batch_id,
                division: batch.division,
                batch_name: batch.batch
            })
            .from(batch)
            .innerJoin(courses_faculty, eq(batch.batch_id, courses_faculty.batch_id))
            .where(eq(courses_faculty.faculty_id, facultyId));

        return facultyBatches;
    } catch (error) {
        console.error('Error in getFacultyBatches:', error);
        throw new AppError(500, 'Failed to fetch faculty batches');
    }
}