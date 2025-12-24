import { Category, TransactionType } from "../../generated/prisma"


export interface CreateCategoryRequest {
    name: string
    type: TransactionType
    icon?: string
}

export interface UpdateCategoryRequest {
    name?: string
    icon?: string
}

export interface CategoryResponse {
    id: number
    name: string
    type: TransactionType
    icon: string | null
}

export function toCategoryResponse(category: Category): CategoryResponse {
    return {
        id: category.id,
        name: category.name,
        type: category.type,
        icon: category.icon
    }
}