import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ResponseError } from "../error/rensponse-error";


export const errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof ZodError) {
        res.status(400).json({
            errors: `Validation Error ${JSON.stringify(error.message)}`
        });
    } else if (error instanceof ResponseError) {
        res.status(error.status).json({
            errors: error.message
        });
    } else {
        res.status(500).json({
            errors: error.message || "Internal Server Error"
        });
    }
};

