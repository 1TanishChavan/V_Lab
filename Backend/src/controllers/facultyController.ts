import { Request, Response, NextFunction } from 'express';
import * as facultyService from '../services/facultyService';
import { AppError } from '../utils/errors';

// Add a new faculty member
export async function addFaculty(req: Request, res: Response, next: NextFunction) {
    try {
        const { username, email, password, department_id, role } = req.body;
        const newFaculty = await facultyService.createFaculty({ username, email, password, department_id, role });
        res.status(201).json(newFaculty);
    } catch (error) {
        console.error('Error in addFaculty:', error);
        next(new AppError(500, 'Failed to create faculty'));
    }
}

// Get faculty by department
export async function getFacultyByDepartment(req: Request, res: Response, next: NextFunction) {
    try {
        const departmentId = parseInt(req.params.departmentId, 10);
        const faculty = await facultyService.getFacultyByDepartment(departmentId);
        res.json(faculty);
    } catch (error) {
        console.error('Error fetching faculty by department:', error);
        next(error);
    }
}

// Get all faculty members
export async function getAllFaculty(req: Request, res: Response, next: NextFunction) {
    try {
        const faculty = await facultyService.getAllFaculty();
        res.json(faculty);
    } catch (error) {
        console.error('Error fetching all faculty:', error);
        next(error);
    }
}

// Get faculty batches
export async function getFacultyBatches(req: Request, res: Response, next: NextFunction) {
    try {
        const facultyId = parseInt(req.params.facultyId, 10); // Assuming facultyId is passed in params
        const batches = await facultyService.getFacultyBatches(facultyId);
        res.json(batches);
    } catch (error) {
        next(error);
    }
}
