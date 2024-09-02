import { db } from 'config/db';
import { users, faculty } from 'models/schema';
import { eq, or } from 'drizzle-orm';

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