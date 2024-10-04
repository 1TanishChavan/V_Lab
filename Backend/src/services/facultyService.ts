import { db } from 'config/db';
import { users, faculty } from 'models/schema';
import { AppError } from '../utils/errors';
import { eq } from 'drizzle-orm';

// Create a new faculty member
export async function createFaculty({
    username,
    email,
    password,
    department_id,
    role,
}: {
    username: string;
    email: string;
    password: string;
    department_id: number;
    role: string;
}) {
    try {
        const newUser = await db.insert(users).values({
            username,
            email,
            password,
            role,
        });

        const insertedUser = await db
            .select({ user_id: users.user_id })
            .from(users)
            .where(eq(users.username, username));

        const userId = insertedUser[0]?.user_id;

        if (!userId) {
            throw new AppError(500, 'Failed to retrieve new user ID');
        }

        await db.insert(faculty).values({
            faculty_id: userId,
            department_id,
        });

        return { user_id: userId, username, email, role, department_id };
    } catch (error) {
        console.error('Error in createFaculty:', error);
        throw new AppError(500, 'Failed to create faculty');
    }
}

// Fetch faculty by department
export async function getFacultyByDepartment(departmentId: number) {
    try {
        return await db
            .select({
                faculty_id: faculty.faculty_id,
                department_id: faculty.department_id,
                username: users.username,
                email: users.email,
            })
            .from(users)
            .innerJoin(faculty, eq(users.user_id, faculty.faculty_id))
            .where(eq(faculty.department_id, departmentId));
    } catch (error) {
        console.error('Error fetching faculty by department:', error);
        throw new AppError(500, 'Failed to fetch faculty by department');
    }
}

// Fetch all faculty members
export async function getAllFaculty() {
    try {
        const facultyMembers = await db
            .select({
                faculty_id: faculty.faculty_id,
                department_id: faculty.department_id,
                username: users.username,
                email: users.email,
            })
            .from(users)
            .innerJoin(faculty, eq(users.user_id, faculty.faculty_id));

        if (!facultyMembers.length) {
            throw new AppError(404, 'No faculty members found');
        }

        return facultyMembers;
    } catch (error) {
        console.error('Error fetching all faculty:', error);
        throw new AppError(500, 'Failed to fetch faculty');
    }
}

// Fetch faculty batches
export async function getFacultyBatches(facultyId: number) {
    try {
        const facultyBatches = await db
            .select({
                batch_id: batch.batch_id,
                division: batch.division,
                batch_name: batch.batch,
            })
            .from(batch)
            .innerJoin(courses_faculty, eq(batch.batch_id, courses_faculty.batch_id))
            .where(eq(courses_faculty.faculty_id, facultyId));

        return facultyBatches;
    } catch (error) {
        console.error('Error fetching faculty batches:', error);
        throw new AppError(500, `Failed to fetch faculty batches: ${error.message}`);
    }
}

// Delete a faculty and corresponding user
export async function deleteFaculty(facultyId: number) {
    try {
        // First, retrieve the faculty record to get the faculty_id, which is also the user_id
        const facultyRecord = await db
            .select({
                user_id: faculty.faculty_id,  // user_id in `users` table is faculty_id in `faculty`
            })
            .from(faculty)
            .where(eq(faculty.faculty_id, facultyId));

        const userId = facultyRecord[0]?.user_id;

        if (!userId) {
            throw new AppError(404, 'Faculty not found');
        }

        // Delete the faculty record
        await db.delete(faculty).where(eq(faculty.faculty_id, facultyId));

        // Delete the user record from `users` table
        await db.delete(users).where(eq(users.user_id, userId));

    } catch (error) {
        console.error('Error deleting faculty:', error);
        throw new AppError(500, 'Failed to delete faculty');
    }
}
