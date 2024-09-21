import { Request, Response, NextFunction } from 'express';
import * as studentService from 'services/studentService';
import { AppError } from '../../src/utils/errors';

export async function getStudentsByBatch(req: Request, res: Response, next: NextFunction) {
    try {
        const students = await studentService.getStudentsByBatch(parseInt(req.params.batchId));
        res.json(students);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}
export async function getStudentSubmissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const { studentId } = req.params;
        const submissions = await submissionService.getStudentSubmissions(parseInt(studentId));
        res.json(submissions);
    } catch (error) {
        next(error);
    }
}
export async function getStudentByRollId(req: Request, res: Response, next: NextFunction) {
    try {
        const student = await studentService.getStudentByRollId(req.params.rollId);
        res.json(student);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

export async function getStudentsByDepartmentAndSemester(req: Request, res: Response, next: NextFunction) {
    try {
        const students = await studentService.getStudentsByDepartmentAndSemester(parseInt(req.params.departmentId), parseInt(req.params.semester));
        res.json(students);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}