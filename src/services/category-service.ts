import { TransactionType } from "../../generated/prisma";
import { ResponseError } from "../error/response-error";
import { CategoryResponse, CreateCategoryRequest, toCategoryResponse, UpdateCategoryRequest } from "../models/category-model";
import { UserJWTPayload } from "../models/user-model";
import { prismaClient } from "../utils/database-util";
import { CategoryValidation } from "../validations/category-validation";
import { validation } from "../validations/validation";


export class CategoryService {
    static async create(user: UserJWTPayload, request: CreateCategoryRequest): Promise<CategoryResponse> {
        const createRequest = validation.validate(CategoryValidation.CREATE, request)

        const category = await prismaClient.category.create({
            data: {
                ...createRequest,
                userId: user.id
            }
        })

        return toCategoryResponse(category)
    }

    static async get(user: UserJWTPayload, categoryId: number): Promise<CategoryResponse> {
        const category = await prismaClient.category.findFirst({
            where: {
                id: categoryId,
                userId: user.id
            }
        }) 

        if(!category) {
            throw new ResponseError(404, "Category not found")
        }

        return toCategoryResponse(category)
    }

    static async list(user: UserJWTPayload, type?: TransactionType): Promise<CategoryResponse[]> {
        const categories = await prismaClient.category.findMany({
            where: {
                userId: user.id,
                type: type
            }
        })

        return categories.map(toCategoryResponse)
    }

    static async update(user: UserJWTPayload, categoryId: number, request: UpdateCategoryRequest): Promise<CategoryResponse> {
        const updateRequest = validation.validate(CategoryValidation.UPDATE, request)

        const existingCategory = await prismaClient.category.findFirst({
            where: {
                id: categoryId,
                userId: user.id
            }
        })

        if(!existingCategory) {
            throw new ResponseError(404, "Category not found")
        }

        const category = await prismaClient.category.update({
            where: {
                id: categoryId
            },
            data: updateRequest
        })

        return toCategoryResponse(category)
    }

    static async remove(user: UserJWTPayload, categoryId: number): Promise<CategoryResponse> {
        const existingCategory = await prismaClient.category.findFirst({
            where: {
                id: categoryId,
                userId: user.id
            },
        })

        if(!existingCategory) {
            throw new ResponseError(404, "Category not found")
        }

        const category = await prismaClient.category.delete({
            where: {
                id: categoryId
            }
        })

        return toCategoryResponse(category)
    }

}