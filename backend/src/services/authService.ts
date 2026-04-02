import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { LoginInput, RegisterInput } from "../schemas/authSchemas";
import { AppError } from "../utils/appError";
import { generateToken } from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/password";

const sanitizeUser = (user: { id: string; name: string; email: string; role: Role }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role
});

export const authService = {
  async register(payload: RegisterInput) {
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
        role: "ANALYST",
        status: "ACTIVE"
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      token,
      user: sanitizeUser(user)
    };
  },

  async login(payload: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: payload.email }
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    if (user.status !== "ACTIVE") {
      throw new AppError("Account is inactive", 403);
    }

    const isPasswordValid = await comparePassword(payload.password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      token,
      user: sanitizeUser(user)
    };
  }
};
