import { Request, Response, NextFunction } from 'express';
import * as courseFacultyService from './../services/courseFacultyService';
import { AppError } from './../utils/errors';
import { AuthenticatedRequest } from './../middlewares/authMiddleware';

export async function deleteCourseFacultyAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const hodDepartmentId = req.user.department_id;
        const courseId = parseInt(req.params.courseId);
        const batchId = parseInt(req.params.batchId);
        await courseFacultyService.deleteCourseFacultyAssignment(courseId, batchId);
        res.status(204).send();
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

export async function getCoursesByFaculty(req: Request, res: Response, next: NextFunction) {
    try {
        const courses = await courseFacultyService.getCoursesByFaculty(parseInt(req.params.facultyId));
        res.json(courses);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

export async function assignCourseToFaculty(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const assignment = await courseFacultyService.assignCourseToFaculty(req.body);
        res.status(201).json(assignment);
    } catch (error) {
        next(error);
    }
}

export async function updateCourseFacultyAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const courseId = parseInt(req.params.courseId);
        const batchId = parseInt(req.params.batchId);
        const { faculty_id } = req.body;

        const assignment = await courseFacultyService.updateCourseFacultyAssignment(
            courseId,
            batchId,
            faculty_id
        );
        res.json(assignment);
    } catch (error) {
        next(error);
    }
}

export async function getFacultyByCourse(req: Request, res: Response, next: NextFunction) {
    try {
        const courseId = parseInt(req.params.courseId);
        const assignments = await courseFacultyService.getFacultyByCourse(courseId);
        res.json(assignments);
    } catch (error) {
        next(error);
    }
}