import { Request, Response, NextFunction } from 'express';
import * as facultyService from '../services/facultyService';
import { AppError } from '../../src/utils/errors';

export async function getFacultyByDepartment(req: Request, res: Response, next: NextFunction) {
    try {
        const faculty = await facultyService.getFacultyByDepartment(parseInt(req.params.departmentId));
        res.json(faculty);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

export async function getAllFaculty(req: Request, res: Response, next: NextFunction) {
    try {
        const faculty = await facultyService.getAllFaculty();
        res.json(faculty);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}