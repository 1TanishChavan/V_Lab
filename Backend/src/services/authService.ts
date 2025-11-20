import { db } from './../config/db';
import { users, students, faculty, batch } from './../models/schema';
import { generateToken } from './../utils/jwtUtils';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { AppError } from './../utils/errors';

export async function registerUser(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const result = await db.insert(users).values({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
    });

    const newUser = await db.select().from(users).where(eq(users.user_id, result[0].insertId)).limit(1);
    let additionalDetails = {};

    if (userData.role === 'Student') {
        await db.insert(students).values({
            student_id: result[0].insertId,
            batch_id: userData.batch_id,
            roll_id: userData.roll_id,
        });

        const studentDetails = await db.select({
            batch_id: students.batch_id,
            roll_id: students.roll_id,
            department_id: batch.department_id,
            semester: batch.semester,
            division: batch.division,
            batch: batch.batch,
        }).from(students)
            .innerJoin(batch, eq(students.batch_id, batch.batch_id))
            .where(eq(students.student_id, result[0].insertId));

        additionalDetails = studentDetails[0] || {};
    } else if (userData.role === 'Faculty' || userData.role === 'HOD' || userData.role === 'Admin') {
        await db.insert(faculty).values({
            faculty_id: result[0].insertId,
            department_id: userData.department_id,
        });

        const facultyDetails = await db.select({
            department_id: faculty.department_id,
        }).from(faculty)
            .where(eq(faculty.faculty_id, result[0].insertId));

        additionalDetails = facultyDetails[0] || {};
    }

    // Prepare payload: Combine user data and additional details
    const userPayload = { ...newUser[0], ...additionalDetails };

    // Security: Remove password before signing the token
    // @ts-ignore
    delete userPayload.password;

    // Generate token with full data
    const token = generateToken(userPayload);

    return {
        token,
        user: userPayload
    };
}

export async function loginUser(loginData: { email: string; password: string }) {
    const user = await db.select().from(users).where(eq(users.email, loginData.email)).limit(1);

    if (user.length === 0) {
        throw new AppError(404, 'User not found');
    }

    const isPasswordValid = await bcrypt.compare(loginData.password, user[0].password);

    if (!isPasswordValid) {
        throw new AppError(401, 'Invalid credentials');
    }

    let additionalDetails = {};

    if (user[0].role === 'Student') {
        const studentDetails = await db.select({
            batch_id: students.batch_id,
            roll_id: students.roll_id,
            department_id: batch.department_id,
            semester: batch.semester,
            division: batch.division,
            batch: batch.batch,
        }).from(students)
            .innerJoin(batch, eq(students.batch_id, batch.batch_id))
            .where(eq(students.student_id, user[0].user_id));

        additionalDetails = studentDetails[0] || {};
    } else if (user[0].role === 'Faculty' || user[0].role === 'HOD') {
        const facultyDetails = await db.select({
            department_id: faculty.department_id,
        }).from(faculty)
            .where(eq(faculty.faculty_id, user[0].user_id));

        additionalDetails = facultyDetails[0] || {};
    }

    // Combine base user data with role-specific details
    const userPayload = { ...user[0], ...additionalDetails };

    // Security: Remove password before signing
    // @ts-ignore
    delete userPayload.password;

    // Store the entire user profile in the token
    const token = generateToken(userPayload);

    return { token, user: userPayload };
}