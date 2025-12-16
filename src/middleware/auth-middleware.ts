import { NextFunction, Response } from "express";
import { UserRequest } from "../models/user-request-model";
import { verifyToken } from "../utils/jwt-util";
import { ResponseError } from "../error/response-error";

export const authMiddleware = (req: UserRequest, res: Response, next: NextFunction) => {

    try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return next(new ResponseError(401, "Unauthorized: No token provided"));
    }

    const payload = verifyToken(token!);
    if (payload) {
        req.user = payload;
        next();
    } else {
        return next(new ResponseError(401, "Unauthorized: Invalid token"));
    }
    } catch (error) {
    next(error);
}
};
