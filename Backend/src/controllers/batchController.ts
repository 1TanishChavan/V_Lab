import { Request, Response, NextFunction } from 'express';
import * as batchService from '../services/batchService';
import { AppError } from '../../src/utils/errors';
import { AuthenticatedRequest } from '../../src/middlewares/authMiddleware';

export async function getBatches(req: Request, res: Response, next: NextFunction) {
    try {
        const batches = await batchService.getAllBatches();
        res.json(batches);
    } catch (error) {
        next(error);
    }
}

export async function createBatch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const newBatch = await batchService.createBatch(req.body);
        res.status(201).json(newBatch);
    } catch (error) {
        next(error);
    }
}

export async function updateBatch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const updatedBatch = await batchService.updateBatch(parseInt(req.params.id), req.body);
        res.json(updatedBatch);
    } catch (error) {
        next(error);
    }
}

export async function deleteBatch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        await batchService.deleteBatch(parseInt(req.params.id));
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

export async function getBatchesByDepartmentAndSemester(req: Request, res: Response, next: NextFunction) {
    try {
        const { departmentId, semester } = req.params;
        const batches = await batchService.getBatchesByDepartmentAndSemester(parseInt(departmentId), parseInt(semester));
        res.json(batches);
    } catch (error) {
        next(error);
    }
}