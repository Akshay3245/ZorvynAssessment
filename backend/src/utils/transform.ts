import { Prisma } from "@prisma/client";

export const decimalToNumber = (value: Prisma.Decimal): number => Number(value.toString());
