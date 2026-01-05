import { prismaClient } from "../utils/database-util";
import { validation } from "../validations/validation";
import { WalletValidation } from "../validations/wallet-validation";

import {
  CreateWalletRequest,
  UpdateWalletRequest
} from "../models/wallet-model";

import { ResponseError } from "../error/response-error";

export class WalletService {
  static async create(userId: number, request: CreateWalletRequest) {
    const data = validation.validate(WalletValidation.CREATE, request);

    const wallet = await prismaClient.wallet.create({
      data: {
        userId,
        name: data.name,
        balance: data.balance ?? 0,       
      },
    });

    return wallet;
  }

  static async getAll(userId: number) {
    return prismaClient.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }

  static async getById(userId: number, walletId: number) {
    const wallet = await prismaClient.wallet.findFirst({
      where: { id: walletId, userId }
    });

    if (!wallet) throw new ResponseError(404, "Wallet not found");

    return wallet;
  }

  static async update(userId: number, walletId: number, request: UpdateWalletRequest) {
    const data = validation.validate(WalletValidation.UPDATE, request);

    const existing = await prismaClient.wallet.findFirst({
      where: { id: walletId, userId }
    });

    if (!existing) throw new ResponseError(404, "Wallet not found");

    const updated = await prismaClient.wallet.update({
      where: { id: walletId },
      data: {
        name: data.name ?? existing.name,
        balance: data.balance ?? existing.balance
      },
    });

    return updated;
  }

  static async delete(userId: number, walletId: number) {
    const existing = await prismaClient.wallet.findFirst({
      where: { id: walletId, userId }
    });

    if (!existing) throw new ResponseError(404, "Wallet not found");

    await prismaClient.wallet.delete({
      where: { id: walletId }
    });

    return { message: "Wallet deleted" };
  }

  static async setDefault(userId: number, walletId: number) {
    const wallet = await prismaClient.wallet.findFirst({
      where: { id: walletId, userId }
    });

    if (!wallet) throw new ResponseError(404, "Wallet not found");

    await prismaClient.wallet.updateMany({
      where: { userId },
      data: { isDefault: false }
    });

    await prismaClient.wallet.update({
      where: { id: walletId },
      data: { isDefault: true }
    });

    await prismaClient.user.update({
      where: { id: userId },
      data: { defaultWalletId: walletId }
    });

    return { message: "Default wallet updated" };
  }


static async getWalletSummary(userId: number, walletId: number, startDate?: Date, endDate?: Date) {
  const wallet = await prismaClient.wallet.findFirst({
    where: { id: walletId, userId },
    include: {
      books: {
        select: {
          id: true,
          name: true,
          program: true
        }
      }
    }
  });

  if (!wallet) throw new ResponseError(404, "Wallet not found");

  // Date filter for transactions
  const dateFilter: any = {};
  if (startDate && endDate) {
    dateFilter.date = {
      gte: startDate,
      lte: endDate
    };
  }

  // Calculate income/expense from items
  const aggregations = await prismaClient.item.groupBy({
    by: ['type'],
    where: {
      walletId: walletId,
      ...dateFilter
    },
    _sum: {
      amount: true
    }
  });

  let totalIncome = 0;
  let totalExpense = 0;

  aggregations.forEach(agg => {
    if (agg.type === 'INCOME') totalIncome = agg._sum.amount || 0;
    if (agg.type === 'EXPENSE') totalExpense = agg._sum.amount || 0;
  });

  return {
    id: wallet.id,
    name: wallet.name,
    balance: wallet.balance,
    isDefault: wallet.isDefault,
    totalIncome,
    totalExpense,
    netFlow: totalIncome - totalExpense,
    usedInBooks: wallet.books
  };
}


}
