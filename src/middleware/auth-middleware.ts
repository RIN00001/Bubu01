import { NextFunction, Response } from "express";
import { UserRequest } from "../models/user-request-model";
import { verifyToken } from "../utils/jwt-util";
import { ResponseError } from "../error/rensponse-error";


export const authMiddleware = (req: UserRequest, res: Response, next: NextFunction) => {
    try{
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            next(new ResponseError(401, "Unauthorized: No token provided"))
        }

        const payload = verifyToken(token!)
        if (payload) {
            req.user = payload
        } else {
            next (new ResponseError(401, "Unauthorized: Invalid token"))
        }

        next()
    } catch (error) {
        next(error);
    }
}