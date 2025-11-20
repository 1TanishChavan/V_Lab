import { db } from './../config/db';
import { batch } from './../models/schema';
import { eq, and } from 'drizzle-orm';
import { AppError } from './../utils/errors';

export async function createBatch(batchData: any) {
    try {
        const result = await db.insert(batch).values(batchData);
        return await db.select().from(batch).where(eq(batch.batch_id, result[0].insertId)).limit(1);
    } catch (error) {
        console.error('Error in createBatch:', error);
        throw new AppError(500, 'Internal server error'); // Customize the error message if needed
    }
}



export async function updateBatch(id: number, batchData: any) {
    await db.update(batch)
        .set(batchData)
        .where(eq(batch.batch_id, id));

    const updatedBatch = await db.select().from(batch).where(eq(batch.batch_id, id)).limit(1);

    if (!updatedBatch[0]) {
        throw new AppError(404, 'Batch not found');
    }

    return updatedBatch[0];
}

export async function deleteBatch(id: number) {
    const result = await db.delete(batch).where(eq(batch.batch_id, id));

    if (result[0].affectedRows === 0) {
        throw new AppError(404, 'Batch not found');
    }
}

export async function getBatchesByDepartmentAndSemester(departmentId: number, semester: number) {
    return await db.select()
        .from(batch)
        .where(
            and(
                eq(batch.department_id, departmentId),
                eq(batch.semester, semester)
            )
        );
}
export async function getBatches() {
    return await db.select()
        .from(batch);
}

// NEW: Flexible fetch with optional filters
export async function getBatchesWithFilters(departmentId?: number, semester?: number) {
    const conditions = [];

    if (departmentId) {
        conditions.push(eq(batch.department_id, departmentId));
    }
    if (semester) {
        conditions.push(eq(batch.semester, semester));
    }

    if (conditions.length > 0) {
        return await db.select().from(batch).where(and(...conditions));
    }

    return await db.select().from(batch);
}