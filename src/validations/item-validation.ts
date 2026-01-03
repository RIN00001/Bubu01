import { z, ZodType } from "zod";

export class ItemValidation {
    static readonly CREATE: ZodType = z.object({
        bookId: z.number().int().positive().optional(),
        walletId: z.number().int().positive().optional(),
        categoryId: z.number().int().positive().optional(),
        type: z.enum(["INCOME", "EXPENSE"]),
        amount: z.number().positive(),
        name: z.string().min(1),
        date: z.coerce.date().optional().default(() => new Date()), // Mengubah string ke Date & default ke waktu sekarang
    });

    static readonly GET: ZodType = z.object({
        id: z.number().int().positive(),
    });

    static readonly UPDATE: ZodType = z.object({
        id: z.number().int().positive(),
        bookId: z.number().int().positive().optional(),
        walletId: z.number().int().positive().optional(),
        categoryId: z.number().int().positive().optional(),
        type: z.enum(["INCOME", "EXPENSE"]).optional(),
        amount: z.number().positive().optional(),
        name: z.string().min(1).optional(),
        date: z.coerce.date().optional(),
    });

    static readonly REMOVE: ZodType = z.object({
        id: z.number().int().positive(),
    });
}