import { PrismaClient } from '../../generated/prisma';
import { CreateSavingRequest, UpdateSavingRequest, toSavingResponse, SavingResponse } from '../models/saving-model';

const prisma = new PrismaClient();

export class SavingService {
    async createSaving(data: CreateSavingRequest): Promise<SavingResponse> {
        const user = await prisma.user.findUnique({
            where: { id: data.userId }
        });
        if (!user) {
            throw new Error('User not found');
        }

        const wallets = await prisma.wallet.findMany({
            where: {
                id: { in: data.walletIds },
                userId: data.userId
            }
        });

        if (wallets.length !== data.walletIds.length) {
            throw new Error('One or more wallets not found or do not belong to user');
        }

        const saving = await prisma.saving.create({
            data: {
                userId: data.userId,
                name: data.name,
                target: data.targetAmount,
                current: data.currentAmount || 0,
                deadline: data.goalDate,
                wallets: {
                    connect: data.walletIds.map(id => ({ id }))
                }
            },
            include: { 
                wallets: { 
                    select: { id: true, name: true } 
                } 
            }
        });

        return toSavingResponse(saving);
    }

    async getSavingById(id: number): Promise<SavingResponse | null> {
        const saving = await prisma.saving.findUnique({
            where: { id },
            include: { 
                wallets: { 
                    select: { id: true, name: true } 
                } 
            }
        });

        return saving ? toSavingResponse(saving) : null;
    }

    async getSavingsByUserId(userId: number): Promise<SavingResponse[]> {
        const savings = await prisma.saving.findMany({
            where: { userId },
            include: { 
                wallets: { 
                    select: { id: true, name: true } 
                } 
            }
        });

        return savings.map(toSavingResponse);
    }

    async updateSaving(id: number, data: UpdateSavingRequest): Promise<SavingResponse> {
        if (data.walletIds) {
            const saving = await prisma.saving.findUnique({
                where: { id },
                select: { userId: true }
            });

            if (!saving) {
                throw new Error('Saving not found');
            }

            const wallets = await prisma.wallet.findMany({
                where: {
                    id: { in: data.walletIds },
                    userId: saving.userId
                }
            });

            if (wallets.length !== data.walletIds.length) {
                throw new Error('One or more wallets not found or do not belong to user');
            }
        }

        const saving = await prisma.saving.update({
            where: { id },
            data: {
                name: data.name,
                target: data.targetAmount,
                current: data.currentAmount,
                deadline: data.goalDate,
                ...(data.walletIds && {
                    wallets: {
                        set: data.walletIds.map(id => ({ id }))
                    }
                })
            },
            include: { 
                wallets: { 
                    select: { id: true, name: true } 
                } 
            }
        });

        return toSavingResponse(saving);
    }

    async deleteSaving(id: number): Promise<void> {
        await prisma.saving.delete({
            where: { id }
        });
    }

    async addToSaving(id: number, amount: number): Promise<SavingResponse> {
        const saving = await prisma.saving.update({
            where: { id },
            data: {
                current: { increment: amount }
            },
            include: { 
                wallets: { 
                    select: { id: true, name: true } 
                } 
            }
        });

        return toSavingResponse(saving);
    }
}

export default new SavingService();