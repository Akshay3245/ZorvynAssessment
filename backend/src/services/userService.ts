import { Prisma, Role, UserStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { CreateUserInput, UpdateUserRoleInput, UpdateUserStatusInput, UserListQueryInput } from "../schemas/userSchemas";
import { AppError } from "../utils/appError";
import { hashPassword } from "../utils/password";
import { getPagination } from "../utils/pagination";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.UserSelect;

type SafeUser = Prisma.UserGetPayload<{ select: typeof userSelect }>;

const toSafeUser = (user: SafeUser) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const buildUserWhereClause = (query: UserListQueryInput): Prisma.UserWhereInput => {
  const whereClause: Prisma.UserWhereInput = {};

  if (query.role) {
    whereClause.role = query.role;
  }

  if (query.status) {
    whereClause.status = query.status;
  }

  if (query.search) {
    whereClause.OR = [
      {
        name: {
          contains: query.search,
          mode: "insensitive"
        }
      },
      {
        email: {
          contains: query.search,
          mode: "insensitive"
        }
      }
    ];
  }

  return whereClause;
};

const ensureAnotherActiveAdminExists = async (excludingUserId: string) => {
  const activeAdminCount = await prisma.user.count({
    where: {
      role: "ADMIN",
      status: "ACTIVE",
      id: {
        not: excludingUserId
      }
    }
  });

  if (activeAdminCount === 0) {
    throw new AppError("Cannot remove or deactivate the last active admin", 400);
  }
};

export const userService = {
  async list(query: UserListQueryInput) {
    const { page, limit, skip } = getPagination({
      page: query.page,
      limit: query.limit
    });

    const where = buildUserWhereClause(query);

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: "desc" }],
        select: userSelect
      }),
      prisma.user.count({ where })
    ]);

    return {
      data: users.map(toSafeUser),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async create(payload: CreateUserInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email }
    });

    if (existingUser) {
      throw new AppError("Email is already registered", 409);
    }

    const password = await hashPassword(payload.password);

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password,
        role: (payload.role ?? "VIEWER") as Role,
        status: (payload.status ?? "ACTIVE") as UserStatus
      },
      select: userSelect
    });

    return toSafeUser(user);
  },

  async updateRole(id: string, requestingUser: { id: string }, payload: UpdateUserRoleInput) {
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: userSelect
    });

    if (!existingUser) {
      throw new AppError("User not found", 404);
    }

    if (existingUser.id === requestingUser.id && payload.role !== "ADMIN") {
      throw new AppError("You cannot change your own role from ADMIN", 400);
    }

    if (existingUser.role === "ADMIN" && payload.role !== "ADMIN" && existingUser.status === "ACTIVE") {
      await ensureAnotherActiveAdminExists(existingUser.id);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role: payload.role
      },
      select: userSelect
    });

    return toSafeUser(updatedUser);
  },

  async updateStatus(id: string, requestingUser: { id: string }, payload: UpdateUserStatusInput) {
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: userSelect
    });

    if (!existingUser) {
      throw new AppError("User not found", 404);
    }

    if (existingUser.id === requestingUser.id && payload.status === "INACTIVE") {
      throw new AppError("You cannot deactivate your own account", 400);
    }

    if (existingUser.role === "ADMIN" && existingUser.status === "ACTIVE" && payload.status === "INACTIVE") {
      await ensureAnotherActiveAdminExists(existingUser.id);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        status: payload.status
      },
      select: userSelect
    });

    return toSafeUser(updatedUser);
  }
};
