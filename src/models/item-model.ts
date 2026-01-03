import { Item, TransactionType } from "../../generated/prisma"



export interface CreateItemRequest {
    bookId: number
    walletId: number
    categoryId: number
    type: TransactionType
    amount: number
    name: string
    date?: string | Date
}

export interface UpdateItemRequest {
    id: number
    bookId?: number
    walletId?: number
    categoryId?: number
    type?: TransactionType
    amount?: number
    name?: string
    date?: string | Date
}

export interface ItemResponse {
    id: number
    bookId: number | null
    walletId: number | null
    categoryId: number | null
    type: TransactionType
    amount: number
    name: string
    date: string | Date
}

export function toItemResponse (item: Item): ItemResponse{
    return {
        id: item.id,
        bookId: item.bookId,
        walletId: item.walletId,
        categoryId: item.categoryId,
        type: item.type,
        amount: item.amount,
        name: item.name,
        date: item.date
    }
}