import { db } from '../config/db';
import { practicals, prac_io, prac_language, programming_language } from '../models/schema';
import { eq, and } from 'drizzle-orm';
import { AppError } from '../utils/errors';


// export async function createPractical(practicalData: any) {
//     const { prac_io: pracIoData, prac_language: pracLanguageData, ...practicalInfo } = practicalData;

//     // Start a transaction to ensure all related data is inserted successfully
//     return await db.transaction(async (trx) => {
//         try {
//             const result = await trx.insert(practicals).values(practicalInfo);
//             const practicalId = result[0].insertId;

//             // Insert practical I/O data
//             if (pracIoData && Array.isArray(pracIoData)) {
//                 await Promise.all(pracIoData.map(io =>
//                     trx.insert(prac_io).values({
//                         ...io,
//                         practical_id: practicalId
//                     })
//                 ));
//             }

//             // Insert programming language data
//             if (pracLanguageData && Array.isArray(pracLanguageData)) {
//                 await Promise.all(pracLanguageData.map(lang =>
//                     trx.insert(prac_language).values({
//                         ...lang,
//                         practical_id: practicalId
//                     })
//                 ));
//             }

//             // Fetch the newly created practical with all related data
//             const newPractical = await getPracticalById(practicalId);

//             return newPractical;
//         } catch (error) {
//             console.error('Error in createPractical:', error);
//             throw new AppError(500, 'Failed to create practical');
//         }
//     });
// }

// export async function updatePractical(practicalId: number, practicalData: any) {
//     const { prac_io: pracIoData, prac_language: pracLanguageData, ...practicalInfo } = practicalData;

//     return await db.transaction(async (trx) => {
//         try {
//             // Update practical info
//             await trx.update(practicals)
//                 .set(practicalInfo)
//                 .where(eq(practicals.practical_id, practicalId));

//             // Update practical I/O data
//             if (pracIoData && Array.isArray(pracIoData)) {
//                 await trx.delete(prac_io).where(eq(prac_io.practical_id, practicalId));
//                 await Promise.all(pracIoData.map(io =>
//                     trx.insert(prac_io).values({
//                         ...io,
//                         practical_id: practicalId
//                     })
//                 ));
//             }

//             // Update programming language data
//             if (pracLanguageData && Array.isArray(pracLanguageData)) {
//                 await trx.delete(prac_language).where(eq(prac_language.practical_id, practicalId));
//                 await Promise.all(pracLanguageData.map(lang =>
//                     trx.insert(prac_language).values({
//                         ...lang,
//                         practical_id: practicalId
//                     })
//                 ));
//             }

//             // Fetch the updated practical with all related data
//             const updatedPractical = await getPracticalById(practicalId);

//             if (!updatedPractical) {
//                 throw new AppError(404, 'Practical not found');
//             }

//             return updatedPractical;
//         } catch (error) {
//             console.error('Error in updatePractical:', error);
//             if (error instanceof AppError) {
//                 throw error;
//             }
//             throw new AppError(500, 'Failed to update practical');
//         }
//     });
// }

export async function createPractical(practicalData: any) {
    const { prac_io: pracIoData, prac_language: pracLanguageData, ...practicalInfo } = practicalData;

    await db.transaction(async (tx) => {
        const result = await tx.insert(practicals).values(practicalInfo);
        const newPractical = await tx.select().from(practicals).where(eq(practicals.practical_id, result[0].insertId)).limit(1);

        if (pracIoData) {
            for (const io of pracIoData) {
                await tx.insert(prac_io).values({
                    ...io,
                    practical_id: newPractical[0].practical_id
                });
            }
        }

        if (pracLanguageData) {
            for (const lang of pracLanguageData) {
                await tx.insert(prac_language).values({
                    ...lang,
                    practical_id: newPractical[0].practical_id
                });
            }
        }

        return newPractical[0];
    });
}

export async function deletePractical(practicalId: number) {
    return await db.transaction(async (trx) => {
        try {
            // Delete related data first
            await trx.delete(prac_io).where(eq(prac_io.practical_id, practicalId));
            await trx.delete(prac_language).where(eq(prac_language.practical_id, practicalId));

            // Delete the practical
            const result = await trx.delete(practicals).where(eq(practicals.practical_id, practicalId));

            if (result[0].affectedRows === 0) {
                throw new AppError(404, 'Practical not found');
            }
        } catch (error) {
            console.error('Error in deletePractical:', error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(500, 'Failed to delete practical');
        }
    });
}

export async function getPracticals() {
    try {
        return await db.select().from(practicals);
    } catch (error) {
        console.error('Error in getPracticals:', error);
        throw new AppError(500, 'Failed to fetch practicals');
    }
}

// export async function getPracticalById(practicalId: number) {
//     try {
//         const practical = await db.select()
//             .from(practicals)
//             .where(eq(practicals.practical_id, practicalId))
//             .limit(1);

//         if (!practical[0]) {
//             return null;
//         }

//         const pracIo = await db.select().from(prac_io).where(eq(prac_io.practical_id, practicalId));
//         const pracLanguage = await db.select().from(prac_language).where(eq(prac_language.practical_id, practicalId));

//         return {
//             ...practical[0],
//             prac_io: pracIo,
//             prac_language: pracLanguage
//         };
//     } catch (error) {
//         console.error('Error in getPracticalById:', error);
//         throw new AppError(500, 'Failed to fetch practical');
//     }
// }

export async function getPracticalByCourse(courseId: number) {
    try {
        return await db.select()
            .from(practicals)
            .where(eq(practicals.course_id, courseId));
    } catch (error) {
        console.error('Error in getPracticalByCourse:', error);
        throw new AppError(500, 'Failed to fetch practicals for the course');
    }
}

export async function updatePractical(practicalId: number, practicalData: any) {
    const { prac_io: pracIoData, prac_language: pracLanguageData, ...practicalInfo } = practicalData;

    await db.update(practicals)
        .set(practicalInfo)
        .where(eq(practicals.practical_id, practicalId));

    if (pracIoData) {
        // Delete existing test cases
        await db.delete(prac_io).where(eq(prac_io.practical_id, practicalId));

        // Insert new test cases
        for (const io of pracIoData) {
            await db.insert(prac_io).values({
                ...io,
                practical_id: practicalId
            });
        }
    }

    if (pracLanguageData) {
        // Delete existing language associations
        await db.delete(prac_language).where(eq(prac_language.practical_id, practicalId));

        // Insert new language associations
        for (const lang of pracLanguageData) {
            await db.insert(prac_language).values({
                ...lang,
                practical_id: practicalId
            });
        }
    }

    return getPracticalById(practicalId);
}

export async function getPracticalById(practicalId: number) {
    const practical = await db.select()
        .from(practicals)
        .where(eq(practicals.practical_id, practicalId))
        .limit(1);

    if (!practical[0]) {
        return null;
    }

    const pracIo = await db.select().from(prac_io).where(eq(prac_io.practical_id, practicalId));
    const pracLanguage = await db.select().from(prac_language).where(eq(prac_language.practical_id, practicalId));

    return {
        ...practical[0],
        prac_io: pracIo,
        prac_language: pracLanguage
    };
}

export async function getPracticalLanguages(practicalId: number) {
    try {
        return await db.select()
            .from(prac_language)
            .innerJoin(programming_language, eq(prac_language.programming_language_id, programming_language.programming_language_id))
            .where(eq(prac_language.practical_id, practicalId));
    } catch (error) {
        console.error('Error in getPracticalLanguages:', error);
        throw new AppError(500, 'Failed to fetch practical languages');
    }
}
