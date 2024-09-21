import { Request, Response, NextFunction } from 'express';
import * as facultyService from '../services/facultyService';
import { AppError } from '../../src/utils/errors';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';


// Fetch faculty by department
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

// Fetch all faculty
export async function getAllFaculty(req: Request, res: Response, next: NextFunction) {
    try {
        console.log("hi")
        const faculty = await facultyService.getAllFaculty();
        console.log(faculty)
        res.json(faculty);
    } catch (error) {
        console.error("Error fetching all faculty:", error); // Log the actual error
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({ error: "An unexpected error occurred" });
        }
    }
}

// Get faculty details for the profile view (for specific faculty by ID)
export async function getFacultyDetails(req: Request, res: Response, next: NextFunction) {
    try {
        const facultyId = parseInt(req.params.facultyId);
        const facultyDetails = await facultyService.getFacultyDetails(facultyId);
        res.json(facultyDetails);
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            next(error);
        }
    }
}

export async function getFacultyBatches(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {

        const facultyId = req.user!.user_id;
        const batches = await facultyService.getFacultyBatches(facultyId);
        res.json(batches);
    } catch (error) {
        next(error);
    }
}