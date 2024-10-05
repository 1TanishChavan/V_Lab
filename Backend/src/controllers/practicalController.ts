import { Request, Response, NextFunction } from 'express';
import * as practicalService from '../services/practicalService';
import { AppError } from '../utils/errors';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';



export async function createPractical(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        console.log(req.body)
        const practical = await practicalService.createPractical(req.body);

        res.status(201).json(practical);
    } catch (error) {
        next(error);
    }
}

// export async function updatePractical(req: AuthenticatedRequest, res: Response, next: NextFunction) {
//     try {
//         const practical = await practicalService.updatePractical(parseInt(req.params.id), req.body);
//         res.json(practical);
//     } catch (error) {
//         next(error);
//     }
// }

export async function deletePractical(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        await practicalService.deletePractical(parseInt(req.params.id));
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

export async function getPracticals(req: Request, res: Response, next: NextFunction) {
    try {
        const practicals = await practicalService.getPracticals();
        res.json(practicals);
    } catch (error) {
        next(error);
    }
}

// export async function getPracticalById(req: Request, res: Response, next: NextFunction) {
//     try {
//         const practical = await practicalService.getPracticalById(parseInt(req.params.id));
//         if (!practical) {
//             throw new AppError(404, 'Practical not found');
//         }
//         res.json(practical);
//     } catch (error) {
//         next(error);
//     }
// }

export async function getPracticalByCourse(req: Request, res: Response, next: NextFunction) {
    try {
        const practicals = await practicalService.getPracticalByCourse(parseInt(req.params.courseId));
        res.json(practicals);
    } catch (error) {
        next(error);
    }
}

export async function updatePractical(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const practical = await practicalService.updatePractical(parseInt(req.params.id), req.body);
        res.json(practical);
    } catch (error) {
        next(error);
    }
}

export async function getPracticalById(req: Request, res: Response, next: NextFunction) {
    try {
        const practical = await practicalService.getPracticalById(parseInt(req.params.id));
        if (!practical) {
            throw new AppError(404, 'Practical not found');
        }
        res.json(practical);
    } catch (error) {
        next(error);
    }
}

export async function getPracticalLanguages(req: Request, res: Response, next: NextFunction) {
    try {
        const practicalId = parseInt(req.params.id);
        if (isNaN(practicalId)) {
            throw new AppError(400, 'Invalid practical ID');
        }

        const languages = await practicalService.getPracticalLanguages(practicalId);

        if (!languages) {
            throw new AppError(404, 'No languages found for the specified practical');
        }

        res.json(languages);
    } catch (error) {
        next(error);
    }
}
