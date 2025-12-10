import { prismaClient } from "../utils/database-util";
import { validation } from "../validations/validation";
import { BookValidation } from "../validations/book-validation";
import { CreateBookRequest, UpdateBookRequest } from "../models/book-model";
import { ResponseError } from "../error/rensponse-error";

export class BookService {
  static async create(userId: number, request: CreateBookRequest) {
    const data = validation.validate(BookValidation.CREATE, request);

    const book = await prismaClient.book.create({
      data: {
        userId,
        name: data.name,
        program: data.program,
        wallets: data.walletIds
          ? { connect: data.walletIds.map((id) => ({ id })) }
          : undefined,
      },
    });

    return book;
  }

  static async getAll(userId: number) {
    return prismaClient.book.findMany({
      where: { userId },
      include: {
        wallets: true,
      },
    });
  }

  static async getById(userId: number, bookId: number) {
    const book = await prismaClient.book.findFirst({
      where: { id: bookId, userId },
      include: {
        wallets: true,
        items: true,
      },
    });

    if (!book) throw new ResponseError(404, "Book not found");
    return book;
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
              set: data.walletIds.map((id) => ({ id })), // replaces existing relations
            }
          : undefined,
      },
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
}
