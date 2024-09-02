import { db } from 'config/db';
import { users, students, departments } from 'models/schema';
import { eq } from 'drizzle-orm';

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