import { Item, TransactionType } from "../../generated/prisma/client"; // Ensure TransactionType is imported
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

        if (item.bookId) {
            const book = await prismaClient.book.findFirst({
                where: { id: item.bookId, userId: user.id }
            });
            if (!book) throw new ResponseError(404, "Item not found (Book access denied)");
        } else if (item.walletId) {
            const wallet = await prismaClient.wallet.findFirst({
                where: { id: item.walletId, userId: user.id }
            });
            if (!wallet) throw new ResponseError(404, "Item not found (Wallet access denied)");
        }

        return item;
    }

    // 1. CREATE: Add Item AND Update Wallet Balance
    static async create(user: UserJWTPayload, request: CreateItemRequest) {
        const createRequest = validation.validate(ItemValidation.CREATE, request);

        // Validation checks (kept from your original code)
        if (createRequest.bookId) {
            const book = await prismaClient.book.findFirst({
                where: { id: createRequest.bookId, userId: user.id }
            });
            if (!book) throw new ResponseError(404, "Book not found");
        }

        if (createRequest.walletId) {
            const wallet = await prismaClient.wallet.findFirst({
                where: { id: createRequest.walletId, userId: user.id }
            });
            if (!wallet) throw new ResponseError(404, "Wallet not found");
        }

        if (createRequest.categoryId) {
            const category = await prismaClient.category.findFirst({
                where: { id: createRequest.categoryId, userId: user.id }
            });
            if (!category) throw new ResponseError(404, "Category not found");
        }

        // --- TRANSACTION START ---
        // We use a transaction to ensure the Item is created AND the Wallet is updated simultaneously.
        const item = await prismaClient.$transaction(async (tx) => {
            // 1. Create the Item
            const newItem = await tx.item.create({
                data: createRequest as any
            });

            // 2. If it is attached to a Wallet, update the balance
            if (createRequest.walletId) {
                if (createRequest.type === 'EXPENSE') {
                    // Decrease Wallet Balance
                    await tx.wallet.update({
                        where: { id: createRequest.walletId },
                        data: { balance: { decrement: createRequest.amount } }
                    });
                } else if (createRequest.type === 'INCOME') {
                    // Increase Wallet Balance
                    await tx.wallet.update({
                        where: { id: createRequest.walletId },
                        data: { balance: { increment: createRequest.amount } }
                    });
                }
            }

            return newItem;
        });
        // --- TRANSACTION END ---

        return toItemResponse(item);
    }

    static async get(user: UserJWTPayload, itemId: number) {
        const getRequest = validation.validate(ItemValidation.GET, { id: itemId })
        const item = await this.checkItemOwnership(user, getRequest.id)
        return toItemResponse(item)
    }

    static async list(user: UserJWTPayload) {
        const items = await prismaClient.item.findMany({
            where: {
                OR: [
                    { book: { userId: user.id } },
                    { wallet: { userId: user.id } }
                ]
            },
            orderBy: {
                date: 'desc'
            }
        })

        return items.map(toItemResponse)
    }

    // 2. UPDATE: Handle Balance changes if amount or type is edited
    static async update(user: UserJWTPayload, request: UpdateItemRequest) {
        const updateRequest = validation.validate(ItemValidation.UPDATE, request);
        
        // Get the OLD item data first to see what changed
        const oldItem = await this.checkItemOwnership(user, updateRequest.id);

        // Validation checks
        if (updateRequest.categoryId) {
            const category = await prismaClient.category.findFirst({
                where: { id: updateRequest.categoryId, userId: user.id }
            });
            if (!category) throw new ResponseError(404, `Category not found`);
        }
        
        // Note: Logic allows changing books/wallets, but simpler to restrict to same wallet for now.
        // Assuming walletId checks are similar to Create...

        const { id, ...dataToUpdate } = updateRequest;

        const updatedItem = await prismaClient.$transaction(async (tx) => {
            // 1. Revert the effect of the OLD item on the wallet
            if (oldItem.walletId) {
                if (oldItem.type === 'EXPENSE') {
                    // Revert expense = Add money back
                    await tx.wallet.update({
                        where: { id: oldItem.walletId },
                        data: { balance: { increment: oldItem.amount } }
                    });
                } else if (oldItem.type === 'INCOME') {
                    // Revert income = Remove money
                    await tx.wallet.update({
                        where: { id: oldItem.walletId },
                        data: { balance: { decrement: oldItem.amount } }
                    });
                }
            }

            // 2. Update the Item
            const currentItem = await tx.item.update({
                where: { id: id },
                data: dataToUpdate
            });

            // 3. Apply the effect of the NEW (updated) item on the wallet
            // Note: If walletId changed in updateRequest, use that, otherwise use old walletId
            const targetWalletId = updateRequest.walletId ?? oldItem.walletId;
            const targetType = updateRequest.type ?? oldItem.type;
            const targetAmount = updateRequest.amount ?? oldItem.amount;

            if (targetWalletId) {
                if (targetType === 'EXPENSE') {
                    await tx.wallet.update({
                        where: { id: targetWalletId },
                        data: { balance: { decrement: targetAmount } }
                    });
                } else if (targetType === 'INCOME') {
                    await tx.wallet.update({
                        where: { id: targetWalletId },
                        data: { balance: { increment: targetAmount } }
                    });
                }
            }

            return currentItem;
        });

        return toItemResponse(updatedItem);
    }

    // 3. REMOVE: Revert the balance when deleting an item
    static async remove(user: UserJWTPayload, itemId: number) {
        const removeRequest = validation.validate(ItemValidation.REMOVE, { id: itemId });
        const itemToDelete = await this.checkItemOwnership(user, removeRequest.id);

        await prismaClient.$transaction(async (tx) => {
            // 1. Delete the Item
            await tx.item.delete({
                where: { id: removeRequest.id }
            });

            // 2. Revert balance
            if (itemToDelete.walletId) {
                if (itemToDelete.type === 'EXPENSE') {
                    // If we delete an expense, money goes back to wallet
                    await tx.wallet.update({
                        where: { id: itemToDelete.walletId },
                        data: { balance: { increment: itemToDelete.amount } }
                    });
                } else if (itemToDelete.type === 'INCOME') {
                    // If we delete an income, money is removed from wallet
                    await tx.wallet.update({
                        where: { id: itemToDelete.walletId },
                        data: { balance: { decrement: itemToDelete.amount } }
                    });
                }
            }
        });

        return toItemResponse(itemToDelete);
    }
}