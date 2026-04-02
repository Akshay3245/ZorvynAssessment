import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { CategoryTotalsQueryInput } from "../schemas/dashboardSchemas";
import { decimalToNumber } from "../utils/transform";

const getMonthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

const getMonthLabel = (year: number, month: number) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric"
  }).format(new Date(year, month, 1));

type RequestingUser = {
  id: string;
  role: Role;
};

const buildScopeWhere = (requestingUser: RequestingUser) =>
  requestingUser.role === "ADMIN" ? {} : { userId: requestingUser.id };

export const dashboardService = {
  async summary(requestingUser: RequestingUser) {
    const aggregates = await prisma.transaction.groupBy({
      by: ["type"],
      where: buildScopeWhere(requestingUser),
      _sum: {
        amount: true
      }
    });

    let totalIncome = 0;
    let totalExpense = 0;

    for (const item of aggregates) {
      const amount = item._sum.amount ? decimalToNumber(item._sum.amount) : 0;
      if (item.type === "INCOME") {
        totalIncome = amount;
      } else {
        totalExpense = amount;
      }
    }

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense
    };
  },

  async categoryTotals(requestingUser: RequestingUser, input: CategoryTotalsQueryInput) {
    const totals = await prisma.transaction.groupBy({
      by: ["category"],
      where: {
        ...buildScopeWhere(requestingUser),
        type: input.type
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          amount: "desc"
        }
      }
    });

    return totals.map((entry) => ({
      category: entry.category,
      total: entry._sum.amount ? decimalToNumber(entry._sum.amount) : 0,
      count: entry._count.id
    }));
  },

  async monthlyTrends(requestingUser: RequestingUser, months = 6) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        ...buildScopeWhere(requestingUser),
        date: {
          gte: startDate
        }
      },
      orderBy: {
        date: "asc"
      },
      select: {
        amount: true,
        type: true,
        date: true
      }
    });

    const buckets = new Map<
      string,
      {
        month: string;
        income: number;
        expense: number;
        net: number;
      }
    >();

    for (let index = 0; index < months; index += 1) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + index, 1);
      const key = getMonthKey(date);

      buckets.set(key, {
        month: getMonthLabel(date.getFullYear(), date.getMonth()),
        income: 0,
        expense: 0,
        net: 0
      });
    }

    for (const transaction of transactions) {
      const key = getMonthKey(transaction.date);
      const amount = decimalToNumber(transaction.amount);
      const bucket = buckets.get(key);

      if (!bucket) {
        continue;
      }

      if (transaction.type === "INCOME") {
        bucket.income += amount;
      } else {
        bucket.expense += amount;
      }

      bucket.net = bucket.income - bucket.expense;
    }

    return Array.from(buckets.values());
  },

  async recentTransactions(requestingUser: RequestingUser, limit = 5) {
    const transactions = await prisma.transaction.findMany({
      where: buildScopeWhere(requestingUser),
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        id: true,
        amount: true,
        type: true,
        category: true,
        date: true,
        note: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      amount: decimalToNumber(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
      note: transaction.note,
      userId: transaction.userId,
      owner: transaction.user
    }));
  }
};
