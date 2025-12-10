import { NextFunction, Response } from "express";
import { CreateItemRequest, UpdateItemRequest } from "../models/item-model";
import { UserRequest } from "../models/user-request-model";
import { ItemService } from "../services/item-service";


export class ItemController {
    static async create (req: UserRequest, res: Response, next: NextFunction) {
        try {
            const request: CreateItemRequest = req.body

            const result = await ItemService.create(req.user!, request)
            res.status(201).json({data: result})
        } catch (error) {
            next(error)
        }
    }

    static async get(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const itemId = Number(req.params.itemId)
            const result = await ItemService.get(req.user!, itemId)
            res.status(200).json({data: result})
        } catch (error) {
            next(error)
        }
    }

    static async list(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const result = await ItemService.list(req.user!)
            res.status(200).json({data: result})
        } catch (error) {
            next(error)
        }
    }

    static async update(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const request: UpdateItemRequest = req.body
            request.id = Number(req.params.itemId)
            const result = await ItemService.update(req.user!, request)
            res.status(200).json({data: result})
        } catch (error) {
            next(error) 
        }
    }

    static async remove(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const itemId = Number(req.params.itemId)
            const result = await ItemService.remove(req.user!, itemId)
            res.status(200).json({data: result})
        } catch (error) {
            next(error)
        }
    }
    
}