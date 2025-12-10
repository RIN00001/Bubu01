// src/user-controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user-service';
import { RegisteredUserRequest, LoginUserRequest } from '../models/user-model';

export class UserController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const request: RegisteredUserRequest = req.body;
      const result = await UserService.register(request);
      return res.status(201).json({ data: result });
    } catch (err) {
      return next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const request: LoginUserRequest = req.body;
      const result = await UserService.login(request);
      return res.status(200).json({ data: result });
    } catch (err) {
      return next(err);
    }
  }
}
