import { z } from "zod";

export class BookValidation {
  static readonly CREATE = z.object({
    name: z.string().min(1),
    program: z.string().optional(),
    walletIds: z.array(z.number()).optional(),
  });

  static readonly UPDATE = z.object({
    name: z.string().optional(),
    program: z.string().optional(),
    walletIds: z.array(z.number()).optional(),
  });
}
