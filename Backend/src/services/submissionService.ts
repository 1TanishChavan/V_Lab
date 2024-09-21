import { db } from '../config/db';
import { submissions, practicals, students, users, prac_io, prac_language, courses, batch_practical_access, batch, courses_faculty } from '../models/schema';
import { eq, and } from 'drizzle-orm';
import { AppError } from '../utils/errors';

export async function createSubmission(submissionData: any) {
    try {
        const result = await db.insert(submissions).values({
            practical_id: submissionData.practicalId,
            student_id: submissionData.studentId,
            code_submitted: submissionData.code,
            submission_time: new Date(),
        });
        return result;
    } catch (error) {
        console.error('Error in createSubmission:', error);
        throw new AppError(500, 'Failed to create submission');
    }
}

export async function getSubmissionStatus(practicalId: number, studentId: number) {
    const submission = await db.select({
        status: submissions.status,
        marks: submissions.marks,
    })
        .from(submissions)
        .where(and(
            eq(submissions.practical_id, practicalId),
            eq(submissions.student_id, studentId)
        ))
        .limit(1);

    return submission[0] || { status: 'Not Submitted', marks: 0 };
}

export async function getPracticalWithSubmissionStatus(courseId: number, studentId: number) {
    const result = await db.select({
        practical_id: practicals.practical_id,
        sr_no: practicals.sr_no,
        practical_name: practicals.practical_name,
        description: practicals.description,
        pdf_url: practicals.pdf_url,
        status: submissions.status,
        marks: submissions.marks,
        deadline: batch_practical_access.deadline,
        lock: batch_practical_access.lock,
    })
        .from(practicals)
        .leftJoin(submissions, and(
            eq(submissions.practical_id, practicals.practical_id),
            eq(submissions.student_id, studentId)
        ))
        .leftJoin(batch_practical_access, eq(batch_practical_access.practical_id, practicals.practical_id))
        .leftJoin(students, eq(students.student_id, studentId))
        .leftJoin(batch, eq(batch.batch_id, students.batch_id))
        .where(and(
            eq(practicals.course_id, courseId),
            eq(batch_practical_access.batch_id, batch.batch_id)
        ));

    return result;
}


export async function getSubmissionsByPractical(practicalId: number, batchId: number, facultyId: number) {
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
            .where(and(
                eq(submissions.practical_id, practicalId),
                eq(students.batch_id, batchId)
            ));

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
                submission_id: submissions.submission_id,
                practical_sr_no: practicals.sr_no,
                practical_name: practicals.practical_name,
                course_name: courses.course_name,
                prac_io: prac_io.input,
                submission_status: submissions.status,
                code_submitted: submissions.code_submitted,
                marks: submissions.marks,
                student_name: users.username,
                roll_id: students.roll_id,
                submission_time: submissions.submission_time,
                batch_name: batch.batch
            })
            .from(submissions)
            .innerJoin(practicals, eq(submissions.practical_id, practicals.practical_id))
            .innerJoin(prac_io, eq(practicals.practical_id, prac_io.practical_id))
            .innerJoin(courses, eq(practicals.course_id, courses.course_id))
            .innerJoin(students, eq(submissions.student_id, students.student_id))
            .innerJoin(users, eq(students.student_id, users.user_id))
            .innerJoin(batch, eq(students.batch_id, batch.batch_id))
            .where(eq(submissions.submission_id, submissionId))
            .limit(1);

        return submission[0];
    } catch (error) {
        console.error('Error in getSubmissionById:', error);
        throw new AppError(500, 'Failed to fetch submission');
    }
}

export async function updateSubmission(submissionId: number, updateData: { status: string; marks: number }) {
    try {
        await db.update(submissions)
            .set({
                status: updateData.status,
                marks: updateData.marks,
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