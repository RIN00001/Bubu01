import { Response, NextFunction } from "express";
import { BookService } from "../services/book-service";
import { UserRequest } from "../models/user-request-model";

export class BookController {
  
  static async create(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      // Service sekarang akan otomatis handle wallet default jika req.body.walletIds kosong
      const result = await BookService.create(userId, req.body);
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await BookService.getAll(userId);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const bookId = Number(req.params.id);

      // Menangkap query params untuk filter tanggal (opsional)
      // Contoh URL: /api/books/1?startDate=2024-01-01&endDate=2024-01-31
      const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
      const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;

      const result = await BookService.getById(userId, bookId, startDate, endDate);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const bookId = Number(req.params.id);
      const result = await BookService.update(userId, bookId, req.body);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const bookId = Number(req.params.id);
      const result = await BookService.delete(userId, bookId);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  static async attachWallet(req: UserRequest, res: Response, next: NextFunction) {
    try {
        const bookId = Number(req.params.id);
        const walletId = Number(req.params.walletId);
        
        const result = await BookService.attachWallet(req.user!.id, bookId, walletId);
        res.json({ data: result });
    } catch (err) {
        next(err);
    }
}

static async detachWallet(req: UserRequest, res: Response, next: NextFunction) {
    try {
        const bookId = Number(req.params.id);
        const walletId = Number(req.params.walletId);
        
        await BookService.detachWallet(req.user!.id, bookId, walletId);
        res.json({ data: "Wallet detached successfully" });
    } catch (err) {
        next(err);
    }
}

static async getBookWallets(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const bookId = Number(req.params.id);
      
      const result = await BookService.getBookWallets(userId, bookId);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
}