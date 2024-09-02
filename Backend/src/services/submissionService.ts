import { db } from '../config/db';
import { submissions, practicals, students, users, prac_io, prac_language, courses } from '../models/schema';
import { eq, and } from 'drizzle-orm';
import { AppError } from '../utils/errors';

export async function createSubmission(submissionData: any, studentId: number) {
    try {
        const result = await db.insert(submissions).values({
            ...submissionData,
            student_id: studentId,
            submission_time: new Date()
        });
        return result;
    } catch (error) {
        console.error('Error in createSubmission:', error);
        throw new AppError(500, 'Failed to create submission');
    }
}

export async function getSubmissionsByPractical(practicalId: number, facultyId: number) {
    try {
        const submissionsList = await db
            .select({
                submission_id: submissions.submission_id,
                roll_id: students.roll_id,
                student_name: users.username,
                code: submissions.code_submitted,
                status: submissions.status,
                submission_time: submissions.submission_time,
                marks: submissions.marks,
                batch: students.batch_id
            })
            .from(submissions)
            .innerJoin(students, eq(submissions.student_id, students.student_id))
            .innerJoin(users, eq(students.student_id, users.user_id))
            .where(and(eq(submissions.practical_id, practicalId), eq(students.batch_id, facultyId)));

        return submissionsList;
    } catch (error) {
        console.error('Error in getSubmissionsByPractical:', error);
        throw new AppError(500, 'Failed to fetch submissions for practical');
    }
}

export async function getSubmissionById(submissionId: number) {
    try {
        const submission = await db
            .select({
                practical_sr_no: practicals.sr_no,
                practical_name: practicals.practical_name,
                course_name: courses.course_name,
                prac_io: prac_io.input,
                prac_language: prac_language.language_name,
                submission_status: submissions.status,
                code_submitted: submissions.code_submitted,
                marks: submissions.marks
            })
            .from(submissions)
            .innerJoin(practicals, eq(submissions.practical_id, practicals.practical_id))
            .innerJoin(prac_io, eq(practicals.practical_id, prac_io.practical_id))
            .innerJoin(prac_language, eq(practicals.practical_id, prac_language.practical_id))
            .innerJoin(courses, eq(practicals.course_id, courses.course_id))
            .where(eq(submissions.submission_id, submissionId))
            .limit(1);

        return submission[0];
    } catch (error) {
        console.error('Error in getSubmissionById:', error);
        throw new AppError(500, 'Failed to fetch submission');
    }
}

export async function updateSubmission(submissionId: number, updateData: { status?: string; marks?: number }) {
    try {
        // Update only the status and marks
        await db.update(submissions)
            .set({
                ...(updateData.status && { status: updateData.status }),
                ...(typeof updateData.marks === 'number' && { marks: updateData.marks }),
            })
            .where(eq(submissions.submission_id, submissionId));

        // Fetch the updated submission to return
        const updatedSubmission = await getSubmissionById(submissionId);
        return updatedSubmission;
    } catch (error) {
        console.error('Error in updateSubmission:', error);
        throw new AppError(500, 'Failed to update submission');
    }
}
