import { db } from 'config/db';
import { users, faculty } from 'models/schema';
import { eq } from 'drizzle-orm';
import { AppError } from '../utils/errors';

// Fetch faculty by department (if departmentId is passed)
export async function getFacultyByDepartment(departmentId: number) {
    return await db.select({
        user_id: faculty.faculty_id,
        department_id: faculty.department_id,
        username: users.username,
        email: users.email
    }).from(users)
        .innerJoin(faculty, eq(users.user_id, faculty.faculty_id))
        .where(eq(faculty.department_id, departmentId));
}

export async function getAllFaculty() {
    try {
        const facultyMembers = await db.select({
            user_id: faculty.faculty_id,
            department_id: faculty.department_id,
            username: users.username,
            email: users.email,
        }).from(users)
        .innerJoin(faculty, eq(users.user_id, faculty.faculty_id));

        if (!facultyMembers.length) {
            throw new AppError(404, 'No faculty members found');
        }

        return facultyMembers;
    } catch (error) {
        console.error("Error fetching all faculty:", error);
        throw new AppError(500, 'Failed to fetch faculty');
    }
}



export async function getFacultyDetails(facultyId: number) {
    const facultyDetails = await db
        .select({
            user_id: users.user_id,
            username: users.username,
            email: users.email,
            department_id: faculty.department_id,
            faculty_id: faculty.faculty_id,
        })
        .from(users)
        .innerJoin(faculty, eq(users.user_id, faculty.faculty_id))  // Ensure user_id matches faculty_id
        .where(eq(faculty.faculty_id, facultyId))
        .limit(1);

    if (facultyDetails.length === 0) {
        throw new AppError(404, 'Faculty not found');
    }

    return facultyDetails[0];
}