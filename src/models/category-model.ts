import { Category } from "../../generated/prisma"


export interface CreateCategoryRequest {
    name: string
    icon?: string
}

export interface UpdateCategoryRequest {
    name?: string
    icon?: string
}

export interface CategoryResponse {
    id: number
    name: string
    icon: string | null
}

export function toCategoryResponse(category: Category): CategoryResponse {
    return {
        id: category.id,
        name: category.name,
        icon: category.icon
    }
}