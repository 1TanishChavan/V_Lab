import { db } from '@/config/db';
import { submissions, practicals, students, users, prac_io, prac_language, courses, batch_practical_access, batch, courses_faculty } from '@/models/schema';
import { eq, and, gt } from 'drizzle-orm';
import { AppError } from '@/utils/errors';
import axios from 'axios';
import redis from '@/config/redis';
import { Buffer } from 'buffer'; // Import Buffer for Base64

// const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6380');

// --- Refactored Judge0 Configuration ---

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'http://localhost:2358';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY; // Get key from .env
const IS_RAPID_API = JUDGE0_API_URL.includes('rapidapi.com');

// 1. Centralized Axios Client for Judge0
const judge0ApiClient = axios.create({
    baseURL: JUDGE0_API_URL,
});

// 2. Conditionally add RapidAPI headers if using the service
if (IS_RAPID_API) {
    if (!JUDGE0_API_KEY) {
        console.warn("JUDGE0_API_URL is set to RapidAPI, but JUDGE0_API_KEY is missing!");
    }
    judge0ApiClient.defaults.headers.common['x-rapidapi-key'] = JUDGE0_API_KEY;
    judge0ApiClient.defaults.headers.common['x-rapidapi-host'] = 'judge0-ce.p.rapidapi.com';
}

// 3. Base64 Helper
const b64Encode = (str: string) => Buffer.from(str).toString('base64');
const b64Decode = (str: string) => Buffer.from(str, 'base64').toString('utf-8');

// 4. Common parameters for POST requests (as per your example)
const judge0PostParams = {
    base64_encoded: 'true',
    wait: 'false', // We will poll manually as per the original logic
};

// --- End of Refactored Configuration ---


const SUBMISSION_TIMEOUT = 30000; // 30 seconds
const RESULTS_EXPIRY = 3600; // 1 hour in seconds
const SUBMISSION_RATE_LIMIT = 30000; // 30 seconds between submissions
const RUN_RATE_LIMIT = 15000; // 15 seconds between code runs
// This constant is no longer used by createBatchSubmissions, as we send all test cases in one batch.
// const BATCH_SIZE = 5; 
const MAX_POLL_ATTEMPTS = 6; // Maximum number of polling attempts
const POLL_INTERVAL = 7000; // 5 seconds between polls


// Removed duplicate interface
interface SubmissionResult {
    token: string;
    input: string;
    expectedOutput: string;
    status?: string;
    actualOutput?: string;
}

export async function getSubmissionResults(submissionId: string) {
    const redisKey = `submission:${submissionId}`;
    const submissionData = await redis.get(redisKey);

    if (!submissionData) {
        throw new AppError(404, 'Submission not found');
    }

    const data = JSON.parse(submissionData);
    return {
        status: data.status,
        testResults: data.results,
        allPassed: data.status === 'completed' &&
            data.results.every((result: any) => result.status === 'Accepted')
    };
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
                // @ts-ignore
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

export async function getStudentSubmissions(studentId: number) {
    try {
        const studentSubmissions = await db
            .select({
                submission_id: submissions.submission_id,
                practical_id: submissions.practical_id,
                practical_sr_no: practicals.sr_no,
                practical_name: practicals.practical_name,
                course_name: courses.course_name,
                submission_time: submissions.submission_time,
                status: submissions.status,
                marks: submissions.marks,
            })
            .from(submissions)
            .innerJoin(practicals, eq(submissions.practical_id, practicals.practical_id))
            .innerJoin(courses, eq(practicals.course_id, courses.course_id))
            .where(eq(submissions.student_id, studentId));

        return studentSubmissions;
    } catch (error) {
        console.error('Error in getStudentSubmissions:', error);
        throw new AppError(500, 'Failed to fetch student submissions');
    }
}

export async function getStudentDetails(studentId: number) {
    try {
        const studentDetails = await db
            .select({
                student_id: students.student_id,
                name: users.username,
                email: users.email,
                roll_id: students.roll_id,
                semester: batch.semester,
                division: batch.division,
                batch: batch.batch,
            })
            .from(students)
            .innerJoin(users, eq(students.student_id, users.user_id))
            .innerJoin(batch, eq(students.batch_id, batch.batch_id))
            .where(eq(students.student_id, studentId))
            .limit(1);

        if (studentDetails.length === 0) {
            throw new AppError(404, 'Student not found');
        }

        return studentDetails[0];
    } catch (error) {
        console.error('Error in getStudentDetails:', error);
        throw error instanceof AppError ? error : new AppError(500, 'Failed to fetch student details');
    }
}

export async function updateStudent(studentId: number, updateData: Partial<typeof students.$inferSelect>) {
    try {
        await db.update(students)
            .set(updateData)
            .where(eq(students.student_id, studentId));

        // Fetch and return the updated student details
        const updatedStudent = await getStudentDetails(studentId);
        return updatedStudent;
    } catch (error) {
        console.error('Error in updateStudent:', error);
        throw new AppError(500, 'Failed to update student');
    }
}

export async function deleteStudent(studentId: number) {
    try {
        await db.delete(students)
            .where(eq(students.student_id, studentId));
    } catch (error) {
        console.error('Error in deleteStudent:', error);
        throw new AppError(500, 'Failed to delete student');
    }
}

export async function getRunResult(token: string) {
    try {
        // REFACTORED: Use centralized client and params
        const response = await judge0ApiClient.get(`/submissions/${token}`, {
            params: { base64_encoded: 'true', fields: 'status,stdout,stderr,time,memory' }
        });

        const data = response.data;
        // REFACTORED: Decode output
        if (data.stdout) data.stdout = b64Decode(data.stdout);
        if (data.stderr) data.stderr = b64Decode(data.stderr);

        return data;
    } catch (error) {
        console.error('Error in getRunResult:', error);
        throw new AppError(500, 'Failed to get run result');
    }
}

export async function getSubmissionStatus_(submissionId: string) {
    try {
        const submissionData = await redis.get(`submission:${submissionId}`);
        if (!submissionData) {
            throw new AppError(404, 'Submission not found');
        }

        const data = JSON.parse(submissionData);
        const completed = data.status === 'completed';

        return {
            status: completed ? data.results.every((r: any) => r.status === 'Accepted') ? 'Accepted' : 'Rejected' : 'Processing',
            completed
        };
    } catch (error) {
        console.error('Error in getSubmissionStatus:', error);
        throw new AppError(500, 'Failed to get submission status');
    }
}

async function storeSubmissionData(submissionData: any, results: SubmissionResult[]) {
    const [result] = await db.insert(submissions).values({
        practical_id: submissionData.practicalId,
        student_id: submissionData.studentId,
        code_submitted: submissionData.code,
        status: 'Pending',
        submission_time: new Date()
    });

    // In MySQL, the insertId is returned directly
    const submissionId = result.insertId;

    // Store additional data in Redis
    const redisKey = `submission:${submissionId}`;
    await redis.set(redisKey, JSON.stringify({
        results,
        status: 'processing',
        practicalId: submissionData.practicalId,
        studentId: submissionData.studentId,
        code: submissionData.code
    }), { EX: RESULTS_EXPIRY });

    return submissionId;
}

async function checkExistingSubmission(submissionData: any) {
    return db
        .select()
        .from(submissions)
        .where(
            and(
                eq(submissions.practical_id, submissionData.practicalId),
                eq(submissions.student_id, submissionData.studentId),
                eq(submissions.status, 'Accepted')
            )
        )
        .limit(1);
}

async function fetchAllTestCases(practicalId: number) {
    return db
        .select()
        .from(prac_io)
        .where(eq(prac_io.practical_id, practicalId));
}

async function saveSubmissionToDatabase(submissionData: any) {
    await db.insert(submissions).values({
        practical_id: submissionData.practicalId,
        student_id: submissionData.studentId,
        code_submitted: submissionData.code,
        submission_time: new Date(),
        status: 'Accepted',
        marks: 15 // Assuming a fixed mark for accepted submissions
    });
}

async function checkRateLimit(userId: number, action: 'submit' | 'run'): Promise<boolean> {
    const key = `ratelimit:${action}:${userId}`;
    const limit = action === 'submit' ? SUBMISSION_RATE_LIMIT : RUN_RATE_LIMIT;

    try {
        const lastAction = await redis.get(key);
        if (lastAction) {
            return false;
        }

        await redis.set(key, Date.now().toString(), { EX: limit });
        return true;
    } catch (error) {
        console.error(`Rate limit check failed for ${action}:`, error);
        return false;
    }
}

export async function runCode(runData: { code: string; language: string; input: string; userId: number }) {
    const canRun = await checkRateLimit(runData.userId, 'run');
    if (!canRun) {
        throw new AppError(429, `Please wait ${RUN_RATE_LIMIT} seconds before running code again`);
    }

    try {
        // REFACTORED: Use centralized client, Base64, and POST params
        const response = await judge0ApiClient.post('/submissions', {
            source_code: b64Encode(runData.code),
            language_id: parseInt(runData.language, 10),
            stdin: b64Encode(runData.input),
            redirect_stderr_to_stdout: true
        }, {
            params: judge0PostParams // Use the common params
        });

        const { token } = response.data;
        const result = await waitForResult(token);

        // REFACTORED: Decode the output from Base64
        const output = result.stdout ? b64Decode(result.stdout) :
            result.stderr ? b64Decode(result.stderr) : 'No output';

        return {
            output: output,
            status: result.status.description,
            time: result.time,
            memory: result.memory
        };
    } catch (error: any) {
        console.error('Error in runCode:', error);
        if (error.response && error.response.status === 422) {
            // REFACTORED: Decode error output if present
            let errorData = error.response.data;
            if (errorData.compile_output) {
                errorData.compile_output = b64Decode(errorData.compile_output);
            }
            console.error('Judge0 API Error:', errorData);
            throw new AppError(422, 'Invalid request payload to Judge0 API');
        }
        throw new AppError(500, 'Failed to run code');
    }
}

async function waitForResult(token: string, timeout = SUBMISSION_TIMEOUT) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        try {
            // REFACTORED: Use centralized client and add params
            const response = await judge0ApiClient.get(`/submissions/${token}`, {
                params: { base64_encoded: 'true', fields: '*' }
            });

            if (response.data.status.id !== 1 && response.data.status.id !== 2) { // Not In Queue or Processing
                // Return the raw B64 data; the *caller* (runCode) will decode it.
                // This keeps this function generic.
                return response.data;
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        } catch (error) {
            console.error('Error fetching result:', error);
            throw new AppError(500, 'Failed to get result');
        }
    }

    throw new AppError(504, 'Submission processing timeout');
}

/**
 * REFACTORED: This function now sends ALL test cases in a *single* batch request
 * to minimize API calls, instead of looping and sending multiple batches.
 */
async function createBatchSubmissions(code: string, language: string, testCases: any[]): Promise<SubmissionResult[]> {

    // 1. Encode the source code ONCE
    const encodedCode = b64Encode(code);
    const langId = parseInt(language, 10);

    // 2. Map ALL test cases to the required submission format
    const submissions = testCases.map(testCase => ({
        source_code: encodedCode,
        language_id: langId,
        stdin: b64Encode(testCase.input),
        expected_output: b64Encode(testCase.output),
        redirect_stderr_to_stdout: true
    }));

    // 3. Send ALL submissions in ONE batch API call
    const response = await judge0ApiClient.post('/submissions/batch',
        { submissions }, // The entire array is the payload
        { params: judge0PostParams } // Use common POST params
    );

    // 4. Map the response (which is an array of {token: string}) back
    return response.data.map((result: any, index: number) => ({
        token: result.token,
        input: testCases[index].input,
        expectedOutput: testCases[index].output
    }));
}

async function pollBatchResults(tokens: string[]): Promise<any[]> {
    let attempts = 0;

    while (attempts < MAX_POLL_ATTEMPTS) {
        const batchTokens = tokens.join(',');

        // REFACTORED: Use centralized client and add params
        const response = await judge0ApiClient.get('/submissions/batch', {
            params: {
                tokens: batchTokens,
                base64_encoded: 'true',
                fields: 'token,status,stdout,stderr' // Get all relevant fields
            }
        });

        const allCompleted = response.data.submissions.every((sub: any) =>
            sub.status.id !== 1 && sub.status.id !== 2); // Not In Queue or Processing

        if (allCompleted) {
            return response.data.submissions;
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }

    throw new AppError(504, 'Submission processing timeout');
}

export async function submitCode(submissionData: {
    code: string;
    language: string;
    practicalId: number;
    studentId: number;
}) {
    // 1. Check for an existing submission for this student and practical
    const [existingSubmission] = await db
        .select({ submission_id: submissions.submission_id })
        .from(submissions)
        .where(and(
            eq(submissions.practical_id, submissionData.practicalId),
            eq(submissions.student_id, submissionData.studentId)
        ))
        .limit(1);

    // 2. If it exists, call updateSubmissionCode to resubmit
    if (existingSubmission) {
        return updateSubmissionCode({
            ...submissionData,
            submissionId: existingSubmission.submission_id
        });
    }

    // 3. If it does not exist, proceed with creating a new submission

    // Fetch all test cases
    const testCases = await db
        .select()
        .from(prac_io)
        .where(eq(prac_io.practical_id, submissionData.practicalId));

    // Create batch submissions (NOW A SINGLE API CALL)
    const batchResults = await createBatchSubmissions(
        submissionData.code,
        submissionData.language,
        testCases
    );

    // Store initial submission
    const [result] = await db.insert(submissions).values({
        practical_id: submissionData.practicalId,
        student_id: submissionData.studentId,
        code_submitted: submissionData.code,
        status: 'Pending',
        submission_time: new Date()
    });

    const submissionId = result.insertId;

    // Start processing results asynchronously
    // This function makes no API calls, just DB/Redis
    processSubmissionResults(submissionId, batchResults).catch(console.error);

    return { submissionId };
}
async function processSubmissionResults(submissionId: number, results: SubmissionResult[]) {
    try {
        const tokens = results.map(r => r.token);
        // This function polls Judge0
        const batchResults = await pollBatchResults(tokens);

        console.log(batchResults)
        const allPassed = batchResults.every(result => result.status.id === 3); // 3 = Accepted
        const status = allPassed ? 'Accepted' : 'Rejected';

        // Update database
        await db.update(submissions)
            .set({
                status,
                marks: allPassed ? 15 : 0 // Or your grading logic
            })
            .where(eq(submissions.submission_id, submissionId));

        // Store simple results in Redis
        await redis.set(`submission:${submissionId}`, JSON.stringify({
            status,
            completed: true
        }), { EX: RESULTS_EXPIRY });

    } catch (error) {
        console.error('Error processing submission results:', error);
        await db.update(submissions)
            .set({ status: 'Rejected' }) // Mark as Rejected on error
            .where(eq(submissions.submission_id, submissionId));
    }
}

export async function getSubmissionStatus(submissionId: string) {
    const data = await redis.get(`submission:${submissionId}`);
    console.log(data);
    if (!data) {
        // Fallback to DB if not in Redis
        const [submission] = await db
            .select()
            .from(submissions)
            .where(eq(submissions.submission_id, parseInt(submissionId)))
            .limit(1);

        if (!submission) {
            throw new AppError(404, 'Submission not found');
        }

        return {
            status: submission.status,
            completed: submission.status !== 'Pending'
        };
    }

    return JSON.parse(data);
}

export async function updateSubmissionCode(submissionData: {
    submissionId: number;
    code: string;
    language: string;
    practicalId: number;
    studentId: number;
}) {
    // Fetch all test cases
    const testCases = await db
        .select()
        .from(prac_io)
        .where(eq(prac_io.practical_id, submissionData.practicalId));

    // Create batch submissions (SINGLE API CALL)
    const batchResults = await createBatchSubmissions(
        submissionData.code,
        submissionData.language,
        testCases
    );

    // Update existing submission to 'Pending'
    await db.update(submissions)
        .set({
            code_submitted: submissionData.code,
            status: 'Pending',
            submission_time: new Date()
        })
        .where(eq(submissions.submission_id, submissionData.submissionId));

    // --- ⬇️ HERE IS THE FIX ⬇️ ---
    //
    // Delete the old, stale result from Redis.
    // This forces getSubmissionStatus to read from the DB (which is "Pending")
    // until the new result is processed and a new key is set.
    try {
        await redis.del(`submission:${submissionData.submissionId}`);
    } catch (error) {
        // Log the error but don't stop the submission
        console.error('Failed to delete stale Redis key:', error);
    }
    // --- ⬆️ END OF FIX ⬆️ ---

    // Process results asynchronously
    processSubmissionResults(submissionData.submissionId, batchResults).catch(console.error);

    return { submissionId: submissionData.submissionId };
}