import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { CreateSavingRequest, UpdateSavingRequest, toSavingResponse } from '../models/saving-model';

const prisma = new PrismaClient();

export class SavingController {
    static async createSaving(req: Request, res: Response) {
    try {
        const data: CreateSavingRequest = req.body;
        
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
            include: { wallets: true }
        });

        res.status(201).json(toSavingResponse(saving));
    } catch (error) {
        res.status(400).json({ error: 'Failed to create saving' });
    }
};

static async getAllSavings(req: Request, res: Response) {
    try {
        const savings = await prisma.saving.findMany({
            include: { wallets: { select: { id: true, name: true } } }
        });

        const response = savings.map(toSavingResponse);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch savings' });
    }
};

static async getSavingById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        
        const saving = await prisma.saving.findUnique({
            where: { id: Number(id) },
            include: { wallets: { select: { id: true, name: true } } }
        });

        if (!saving) {
            return res.status(404).json({ error: 'Saving not found' });
        }

        res.json(toSavingResponse(saving));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch saving' });
    }
};

static async updateSaving(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const data: UpdateSavingRequest = req.body;

        const saving = await prisma.saving.update({
            where: { id: Number(id) },
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
            include: { wallets: true }
        });
        res.json(toSavingResponse(saving));
    } catch (error) {
        res.status(400).json({ error: 'Failed to update saving' });
    }
};

static async deleteSaving(req: Request, res: Response) {
    try {
        const { id } = req.params;
        
        await prisma.saving.delete({
            where: { id: Number(id) }
        });

        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete saving' });
    }
};
}

