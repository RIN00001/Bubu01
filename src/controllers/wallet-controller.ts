import { Response, NextFunction } from "express";
import { WalletService } from "../services/wallet-service";
import { UserRequest } from "../models/user-request-model";

export class WalletController {
  static async create(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const result = await WalletService.create(req.user!.id, req.body);
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const result = await WalletService.getAll(req.user!.id);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const result = await WalletService.getById(
        req.user!.id,
        Number(req.params.id)
      );
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const result = await WalletService.update(
        req.user!.id,
        Number(req.params.id),
        req.body
      );
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const result = await WalletService.delete(
        req.user!.id,
        Number(req.params.id)
      );
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  static async setDefault(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const result = await WalletService.setDefault(
        req.user!.id,
        Number(req.params.id)
      );
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
}
