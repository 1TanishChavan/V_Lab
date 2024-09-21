import express from 'express';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from 'controllers/departmentController';
import { getFacultyDetails } from 'controllers/facultyController';
import { getFacultyByDepartment, getAllFaculty } from 'controllers/facultyController';
import { authMiddleware, roleMiddleware } from 'middlewares/authMiddleware';

const router = express.Router();

// Department routes
router.get('/departments', authMiddleware, getDepartments);

// Faculty routes
router.get('/:facultyId', authMiddleware, getFacultyDetails);
router.get('/department/:departmentId', authMiddleware, getFacultyByDepartment);
router.get('/all', authMiddleware, (req, res, next) => {
    console.log("Received request for all faculty:", req.method, req.url);
    next();
}, getAllFaculty);

export default router;
