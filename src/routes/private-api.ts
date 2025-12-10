import express from 'express';
import { authMiddleware } from '../middleware/auth-middleware';
export const privateRouter = express.Router()

privateRouter.use(authMiddleware)

