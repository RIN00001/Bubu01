import { prismaClient } from "../utils/database-util";
import { validation } from "../validations/validation";
import { BookValidation } from "../validations/book-validation";
import { CreateBookRequest, UpdateBookRequest } from "../models/book-model";
import { ResponseError } from "../error/response-error";

export class BookService {
  
  // --- FITUR BARU: Auto-Connect Default Wallet ---
  static async create(userId: number, request: CreateBookRequest) {
    const data = validation.validate(BookValidation.CREATE, request);

    // 1. Tentukan Wallet mana yang mau disambungkan
    let walletConnectIds: { id: number }[] = [];

    if (data.walletIds && data.walletIds.length > 0) {
      // A. Jika User memilih wallet spesifik (misal lewat centang di UI)
      walletConnectIds = data.walletIds.map((id) => ({ id }));
    } else {
      // B. Jika User TIDAK memilih wallet, cari Wallet Default milik user ini
      const defaultWallet = await prismaClient.wallet.findFirst({
        where: {
          userId: userId,
          isDefault: true // Pastikan field ini ada di schema.prisma
        }
      });

      // Jika ada default wallet, kita masukkan ke list connect
      if (defaultWallet) {
        walletConnectIds = [{ id: defaultWallet.id }];
      }
    }

    // 2. Buat Buku dengan relasi wallet yang sudah disiapkan
    const book = await prismaClient.book.create({
      data: {
        userId,
        name: data.name,
        program: data.program,
        wallets: {
          connect: walletConnectIds // Sambungkan ke wallet (kosong atau default atau pilihan user)
        },
      },
      include: {
        wallets: true // Return walletnya supaya Frontend langsung tau balancenya
      }
    });

    return book;
  }

  // --- GET ALL: Dengan Hitungan Income/Expense ---
  static async getAll(userId: number) {
    // 1. Ambil semua buku & wallet (untuk Balance)
    const books = await prismaClient.book.findMany({
      where: { userId },
      include: {
        wallets: true, 
      },
    });

    // 2. Loop setiap buku untuk menghitung Income & Expense dari tabel Item
    const booksWithStats = await Promise.all(books.map(async (book) => {
      const aggregations = await prismaClient.item.groupBy({
        by: ['type'],
        where: {
          bookId: book.id,
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
        ...book,
        totalIncome,
        totalExpense
      };
    }));

    return booksWithStats;
  }

  // --- GET BY ID: Support Filter Tanggal ---
  static async getById(userId: number, bookId: number, startDate?: Date, endDate?: Date) {
    const book = await prismaClient.book.findFirst({
      where: { id: bookId, userId },
      include: {
        wallets: true,
        items: true,
      },
    });

    if (!book) throw new ResponseError(404, "Book not found");

    // Filter Tanggal
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.date = {
        gte: startDate,
        lte: endDate
      };
    }

    // Hitung Aggregasi
    const aggregations = await prismaClient.item.groupBy({
      by: ['type'],
      where: {
        bookId: book.id,
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
      ...book,
      totalIncome,
      totalExpense
    };
  }

  static async update(userId: number, bookId: number, request: UpdateBookRequest) {
    const data = validation.validate(BookValidation.UPDATE, request);

    const existing = await prismaClient.book.findFirst({
      where: { id: bookId, userId },
    });

    if (!existing) throw new ResponseError(404, "Book not found");

    const updated = await prismaClient.book.update({
      where: { id: bookId },
      data: {
        name: data.name,
        program: data.program,
        wallets: data.walletIds
          ? {
              set: data.walletIds.map((id) => ({ id })), 
            }
          : undefined,
      },
      include: {
        wallets: true // Return wallet terbaru
      }
    });

    return updated;
  }

  static async delete(userId: number, bookId: number) {
    const existing = await prismaClient.book.findFirst({
      where: { id: bookId, userId },
    });
    if (!existing) throw new ResponseError(404, "Book not found");

    await prismaClient.book.delete({
      where: { id: bookId },
    });

    return { message: "Book deleted" };
  }

  static async attachWallet(userId: number, bookId: number, walletId: number) {
    // Verify book ownership
    const book = await prismaClient.book.findFirst({
        where: { id: bookId, userId }
    });
    if (!book) throw new ResponseError(404, "Book not found");

    // Verify wallet ownership  
    const wallet = await prismaClient.wallet.findFirst({
        where: { id: walletId, userId }
    });
    if (!wallet) throw new ResponseError(404, "Wallet not found");

    // Attach wallet to book
    return await prismaClient.book.update({
        where: { id: bookId },
        data: {
            wallets: {
                connect: { id: walletId }
            }
        },
        include: { wallets: true }
    });
}

static async detachWallet(userId: number, bookId: number, walletId: number) {
    const book = await prismaClient.book.findFirst({
        where: { id: bookId, userId }
    });
    if (!book) throw new ResponseError(404, "Book not found");

    await prismaClient.book.update({
        where: { id: bookId },
        data: {
            wallets: {
                disconnect: { id: walletId }
            }
        }
    });
}

static async getBookWallets(userId: number, bookId: number) {
    const book = await prismaClient.book.findFirst({
      where: { id: bookId, userId },
      include: {
        wallets: {
          select: {
            id: true,
            name: true,
            balance: true,
            isDefault: true
          }
        }
      }
    });

    if (!book) throw new ResponseError(404, "Book not found");

    return {
      bookId: book.id,
      bookName: book.name,
      wallets: book.wallets
    };
  }
}