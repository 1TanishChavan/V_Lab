import { Request, Response, NextFunction } from 'express';
import * as batchPracticalAccessService from './../../src/services/batchPracticalAccessService';
import { AppError } from './../../src/utils/errors';
import { AuthenticatedRequest } from './../middlewares/authMiddleware';

export const getBatchPracticalAccess = async (req: Request, res: Response) => {
    try {
        const practicalId = parseInt(req.params.practicalId);
        const courseId = parseInt(req.params.courseId);
        const facultyId = parseInt(req.params.facultyId);

        if (isNaN(practicalId) || isNaN(courseId) || isNaN(facultyId)) {
            return res.status(400).json({ message: 'Invalid parameters' });
        }

        const batchAccess = await batchPracticalAccessService.getBatchPracticalAccess(
            practicalId,
            courseId,
            facultyId
        );

        res.json(batchAccess);
    } catch (error) {
        console.error('Error in getBatchPracticalAccess:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export async function createOrUpdateBatchPracticalAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { practical_id, batch_id, lock, deadline } = req.body;
        const result = await batchPracticalAccessService.createOrUpdateBatchPracticalAccess({
            practical_id,
            batch_id,
            lock,
            deadline: new Date(deadline),
        });
        res.json(result);
    } catch (error) {
        next(error);
    }
}
