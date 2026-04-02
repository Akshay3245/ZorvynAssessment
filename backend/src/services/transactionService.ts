import { Prisma, Role, TransactionType } from "@prisma/client";
import { prisma } from "../config/prisma";
import { CreateTransactionInput, TransactionQueryInput, UpdateTransactionInput } from "../schemas/transactionSchemas";
import { AppError } from "../utils/appError";
import { getPagination } from "../utils/pagination";
import { decimalToNumber } from "../utils/transform";

type RequestingUser = {
  id: string;
  role: Role;
};

const transactionWithOwnerSelect = {
  id: true,
  amount: true,
  type: true,
  category: true,
  date: true,
  note: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  }
} satisfies Prisma.TransactionSelect;

type TransactionWithOwner = Prisma.TransactionGetPayload<{
  select: typeof transactionWithOwnerSelect;
}>;

const toTransactionResponse = (transaction: TransactionWithOwner) => ({
  id: transaction.id,
  amount: decimalToNumber(transaction.amount),
  type: transaction.type,
  category: transaction.category,
  date: transaction.date,
  note: transaction.note,
  userId: transaction.userId,
  owner: transaction.user,
  createdAt: transaction.createdAt,
  updatedAt: transaction.updatedAt
});

const buildWhereClause = (query: TransactionQueryInput): Prisma.TransactionWhereInput => {
  const whereClause: Prisma.TransactionWhereInput = {};

  if (query.type) {
    whereClause.type = query.type;
  }

  if (query.category) {
    whereClause.category = {
      contains: query.category,
      mode: "insensitive"
    };
  }

  if (query.startDate || query.endDate) {
    whereClause.date = {};

    if (query.startDate) {
      whereClause.date.gte = query.startDate;
    }

    if (query.endDate) {
      whereClause.date.lte = query.endDate;
    }
  }

  if (query.userId) {
    whereClause.userId = query.userId;
  }

  return whereClause;
};

const ensureOwnerOrAdmin = (ownerId: string, requestingUser: RequestingUser) => {
  if (requestingUser.role === "ADMIN") {
    return;
  }

  if (requestingUser.id !== ownerId) {
    throw new AppError("Forbidden: cannot access this transaction", 403);
  }
};

const resolveTargetUserId = async (requestingUser: RequestingUser, payload: CreateTransactionInput) => {
  if (payload.userId && requestingUser.role !== "ADMIN") {
    throw new AppError("Only admin can create transactions for other users", 403);
  }

  const targetUserId = payload.userId ?? requestingUser.id;

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, status: true }
  });

  if (!targetUser) {
    throw new AppError("Target user not found", 404);
  }

  if (targetUser.status !== "ACTIVE") {
    throw new AppError("Cannot create transaction for an inactive user", 400);
  }

  return targetUser.id;
};

export const transactionService = {
  async create(requestingUser: RequestingUser, payload: CreateTransactionInput) {
    const userId = await resolveTargetUserId(requestingUser, payload);

    const transaction = await prisma.transaction.create({
      data: {
        amount: payload.amount,
        type: payload.type,
        category: payload.category,
        date: payload.date,
        note: payload.note || null,
        userId
      },
      select: transactionWithOwnerSelect
    });

    return toTransactionResponse(transaction);
  },

  async list(requestingUser: RequestingUser, query: TransactionQueryInput) {
    const { page, limit, skip } = getPagination({
      page: query.page,
      limit: query.limit
    });

    const where = buildWhereClause(query);

    if (requestingUser.role !== "ADMIN") {
      if (query.userId && query.userId !== requestingUser.id) {
        throw new AppError("Forbidden: cannot view other users' transactions", 403);
      }

      where.userId = requestingUser.id;
    }

    const [transactions, total] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        select: transactionWithOwnerSelect
      }),
      prisma.transaction.count({ where })
    ]);

    return {
      data: transactions.map(toTransactionResponse),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getById(id: string, requestingUser: { id: string; role: Role }) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      select: transactionWithOwnerSelect
    });

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    ensureOwnerOrAdmin(transaction.userId, requestingUser);
    return toTransactionResponse(transaction);
  },

  async update(id: string, requestingUser: { id: string; role: Role }, payload: UpdateTransactionInput) {
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!existingTransaction) {
      throw new AppError("Transaction not found", 404);
    }

    ensureOwnerOrAdmin(existingTransaction.userId, requestingUser);

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: payload.amount,
        type: payload.type,
        category: payload.category,
        date: payload.date,
        note: payload.note
      },
      select: transactionWithOwnerSelect
    });

    return toTransactionResponse(transaction);
  },

  async remove(id: string, requestingUser: { id: string; role: Role }) {
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!existingTransaction) {
      throw new AppError("Transaction not found", 404);
    }

    ensureOwnerOrAdmin(existingTransaction.userId, requestingUser);

    await prisma.transaction.delete({
      where: { id }
    });

    return {
      success: true
    };
  }
};
