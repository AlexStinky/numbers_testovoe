import { Request, Response, NextFunction } from "express";

import checker from '../services/checker';

export const validate = async (req: Request, res: Response, next: NextFunction) => {
    const { body } = req;

    let response = {
        success: false,
        message: 'Validation failed'
    };

    if (body) {
        response = await checker.validate(checker.inputSchema, body);

        if (response.success) {
            return next();
        }
    }

    res.send(response);
}