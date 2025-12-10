import { z } from 'zod';

export const createSavingSchema = z.object({
    userId: z.number().int().positive('User ID must be positive'),
    walletIds: z.array(z.number().int().positive()).min(1, 'At least one wallet is required'),
    targetAmount: z.number().positive('Target amount must be positive').optional(),
    currentAmount: z.number().min(0, 'Current amount cannot be negative').optional(),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    goalDate: z.string().datetime().or(z.date()).optional()
});

export const updateSavingSchema = z.object({
    walletIds: z.array(z.number().int().positive()).optional(),
    targetAmount: z.number().positive('Target amount must be positive').optional(),
    currentAmount: z.number().min(0, 'Current amount cannot be negative').optional(),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
    goalDate: z.string().datetime().or(z.date()).optional()
});

export const savingIdSchema = z.object({
    id: z.string().transform(Number).pipe(z.number().int().positive())
});