import { Item } from "../../generated/prisma/client";
import { ResponseError } from "../error/response-error";
import { CreateItemRequest, toItemResponse, UpdateItemRequest } from "../models/item-model";
import { UserJWTPayload } from "../models/user-model";
import { prismaClient } from "../utils/database-util";
import { ItemValidation } from "../validations/item-validation";
import { validation } from "../validations/validation";

export class ItemService {
    private static async checkItemOwnership(user: UserJWTPayload, itemId: number): Promise<Item> {
        const item = await prismaClient.item.findUnique({
            where: { id: itemId }
        });

        if (!item) {
            throw new ResponseError(404, "Item not found");
        }

        // Verify ownership via related book or wallet
        if (item.bookId) {
            const book = await prismaClient.book.findFirst({
                where: { id: item.bookId, userId: user.id }
            });
            if (!book) throw new ResponseError(404, "Item not found or you don't have access");
        } else if (item.walletId) {
            const wallet = await prismaClient.wallet.findFirst({
                where: { id: item.walletId, userId: user.id }
            });
            if (!wallet) throw new ResponseError(404, "Item not found or you don't have access");
        } else {
            // Item without book or wallet is considered orphaned and inaccessible
            throw new ResponseError(404, "Item not found");
        }

        return item;
    }

    static async create(user: UserJWTPayload, request: CreateItemRequest) {
        const createRequest = validation.validate(ItemValidation.CREATE, request);

        // Ensure at least one of bookId or walletId is provided
        if (!createRequest.bookId && !createRequest.walletId) {
            throw new ResponseError(400, "Either bookId or walletId must be provided");
        }

        // Verify ownership of book, wallet, and category if they are provided
        if (createRequest.bookId) {
            const book = await prismaClient.book.findFirst({
                where: { id: createRequest.bookId, userId: user.id }
            });
            if (!book) {
                throw new ResponseError(404, "Book not found");
            }
        }

        if (createRequest.walletId) {
            const wallet = await prismaClient.wallet.findFirst({
                where: { id: createRequest.walletId, userId: user.id }
            });
            if (!wallet) {
                throw new ResponseError(404, "Wallet not found");
            }
        }

        if (createRequest.categoryId) {
            const category = await prismaClient.category.findFirst({
                where: { id: createRequest.categoryId, userId: user.id }
            });
            if (!category) {
                throw new ResponseError(404, "Category not found");
            }
        }

        const item = await prismaClient.item.create({
            data: createRequest
        });

        return toItemResponse(item);
    }

    static async get(user: UserJWTPayload, itemId: number) {
        const getRequest = validation.validate(ItemValidation.GET, {id: itemId})
        const item = await this.checkItemOwnership(user, getRequest.id)
        return toItemResponse(item)
    }

    static async list(user: UserJWTPayload) {
        const items = await prismaClient.item.findMany({
            where: {
                OR: [
                    {book: {userId: user.id}},
                    {wallet: {userId: user.id}}
                ]
            },
            orderBy: {
                date: 'desc'
            }
        })

        return items.map(toItemResponse)
    }

    static async update(user: UserJWTPayload, request: UpdateItemRequest) {
        const updateRequest = validation.validate(ItemValidation.UPDATE, request)
        await this.checkItemOwnership(user, updateRequest.id)

        const item = await prismaClient.item.update({
            where: {id: updateRequest.id},
            data: updateRequest
        })

        return toItemResponse(item)
    }

    static async remove(user: UserJWTPayload, itemId: number) {
        const removeRequest = validation.validate(ItemValidation.REMOVE, {id: itemId})
        await this.checkItemOwnership(user, removeRequest.id)

        const item = await prismaClient.item.delete({
            where: {id: removeRequest.id}
        })

        return toItemResponse(item)
    }
}