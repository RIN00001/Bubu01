import { Response, NextFunction } from "express";
import { UserRequest } from "../models/user-request-model";
import { CategoryService } from "../services/category-service";
import { CreateCategoryRequest, UpdateCategoryRequest } from "../models/category-model";

export class CategoryController {
    static async create(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const request: CreateCategoryRequest = req.body;
            const result = await CategoryService.create(req.user!, request);
            res.status(201).json({ data: result });
        } catch (error) {
            next(error);
        }
    }

    static async get(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const categoryId = Number(req.params.id);
            const result = await CategoryService.get(req.user!, categoryId);
            res.status(200).json({ data: result });
        } catch (error) {
            next(error);
        }
    }

    static async list(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const result = await CategoryService.list(req.user!);
            res.status(200).json({ data: result });
        } catch (error) {
            // Pastikan blok catch ini tidak kosong
            next(error);
        }
    }

    static async update(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const categoryId = Number(req.params.id);
            const request: UpdateCategoryRequest = req.body;
            const result = await CategoryService.update(req.user!, categoryId, request);
            res.status(200).json({ data: result });
        } catch (error) {
            next(error);
        }
    }

    static async remove(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const categoryId = Number(req.params.id);
            const result = await CategoryService.remove(req.user!, categoryId);
            res.status(200).json({ data: result });
        } catch (error) {
            next(error);
        }
    }
}