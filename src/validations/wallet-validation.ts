import { z } from "zod";

export class WalletValidation {
  static readonly CREATE = z.object({
    name: z.string().min(1),
    balance: z.number().optional(),
  });

  static readonly UPDATE = z.object({
    name: z.string().optional(),
    balance: z.number().optional(),
  });
}
