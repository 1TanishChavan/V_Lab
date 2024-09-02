import { Request, Response, NextFunction } from 'express';
import * as submissionService from '../services/submissionService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { AppError } from '../../src/utils/errors';


export async function createSubmission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const submission = await submissionService.createSubmission(req.body, req.user!.user_id);
        res.status(201).json(submission);
    } catch (error) {
        next(error);
    }
}

export async function getSubmissionsByPractical(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const submissions = await submissionService.getSubmissionsByPractical(parseInt(req.params.practicalId), req.user!.user_id);
        res.json(submissions);
    } catch (error) {
        next(error);
    }
}

export async function getSubmissionById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const submission = await submissionService.getSubmissionById(parseInt(req.params.submissionId));
        res.json(submission);
    } catch (error) {
        next(error);
    }
}

export async function updateSubmission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { status, marks } = req.body;
        if (typeof status !== 'string' && typeof marks !== 'number') {
            throw new AppError(400, 'Invalid input');
        }

        const updatedSubmission = await submissionService.updateSubmission(parseInt(req.params.submissionId), { status, marks });
        res.json(updatedSubmission);
    } catch (error) {
        next(error);
    }
}
