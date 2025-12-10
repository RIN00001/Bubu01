import { Saving } from '../../generated/prisma';

export interface CreateSavingRequest {
    userId: number;
    walletIds: number[];
    targetAmount?: number;
    currentAmount?: number;
    name: string;
    goalDate?: Date;
}

export interface UpdateSavingRequest {
    id: number;
    walletIds?: number[];
    targetAmount?: number;
    currentAmount?: number;
    name?: string;
    goalDate?: Date;
}

export interface SavingResponse {
    id: number;
    userId: number;
    targetAmount: number | null;
    currentAmount: number;
    name: string;
    goalDate: Date | null;
    wallets?: { id: number; name: string }[];
}

export function toSavingResponse(saving: Saving & { wallets?: any[] }): SavingResponse {
    return {
        id: saving.id,
        userId: saving.userId,
        targetAmount: saving.target,
        currentAmount: saving.current,
        name: saving.name,
        goalDate: saving.deadline,
        wallets: saving.wallets
    };
}