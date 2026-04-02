import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedUser = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "ANALYST" | "VIEWER";
  status: "ACTIVE" | "INACTIVE";
};

type TransactionProfile = {
  salaryBase: number;
  freelanceA: number;
  freelanceB: number;
  rent: number;
  groceries: number;
  transport: number;
  utilities: number;
  insurance: number;
  shopping: number;
  entertainment: number;
};

const atDate = (monthOffset: number, day: number) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + monthOffset, day);
};

const buildDummyTransactions = (userId: string, profile: TransactionProfile) => [
  { amount: profile.salaryBase - 2000, type: "INCOME" as const, category: "Salary", date: atDate(-5, 1), note: "Monthly salary" },
  { amount: profile.salaryBase - 4000, type: "INCOME" as const, category: "Salary", date: atDate(-4, 1), note: "Monthly salary" },
  { amount: profile.salaryBase - 1000, type: "INCOME" as const, category: "Salary", date: atDate(-3, 1), note: "Monthly salary" },
  { amount: profile.salaryBase, type: "INCOME" as const, category: "Salary", date: atDate(-2, 1), note: "Monthly salary" },
  { amount: profile.salaryBase + 1000, type: "INCOME" as const, category: "Salary", date: atDate(-1, 1), note: "Monthly salary" },
  { amount: profile.salaryBase + 2000, type: "INCOME" as const, category: "Salary", date: atDate(0, 1), note: "Monthly salary" },
  { amount: profile.freelanceA, type: "INCOME" as const, category: "Freelance", date: atDate(-4, 18), note: "Consulting work" },
  { amount: profile.freelanceB, type: "INCOME" as const, category: "Freelance", date: atDate(-1, 16), note: "Project support" },
  { amount: profile.rent, type: "EXPENSE" as const, category: "Rent", date: atDate(-5, 5), note: "Apartment rent" },
  { amount: profile.rent, type: "EXPENSE" as const, category: "Rent", date: atDate(-4, 5), note: "Apartment rent" },
  { amount: profile.rent, type: "EXPENSE" as const, category: "Rent", date: atDate(-3, 5), note: "Apartment rent" },
  { amount: profile.rent, type: "EXPENSE" as const, category: "Rent", date: atDate(-2, 5), note: "Apartment rent" },
  { amount: profile.rent, type: "EXPENSE" as const, category: "Rent", date: atDate(-1, 5), note: "Apartment rent" },
  { amount: profile.rent, type: "EXPENSE" as const, category: "Rent", date: atDate(0, 5), note: "Apartment rent" },
  { amount: profile.groceries, type: "EXPENSE" as const, category: "Groceries", date: atDate(0, 8), note: "Monthly groceries" },
  { amount: profile.transport, type: "EXPENSE" as const, category: "Transport", date: atDate(0, 12), note: "Fuel and commute" },
  { amount: profile.utilities, type: "EXPENSE" as const, category: "Utilities", date: atDate(-1, 14), note: "Electricity and internet" },
  { amount: profile.insurance, type: "EXPENSE" as const, category: "Insurance", date: atDate(-2, 20), note: "Health insurance premium" },
  { amount: profile.shopping, type: "EXPENSE" as const, category: "Shopping", date: atDate(-1, 22), note: "Clothes and essentials" },
  { amount: profile.entertainment, type: "EXPENSE" as const, category: "Entertainment", date: atDate(0, 18), note: "Weekend outings" }
].map((entry) => ({ ...entry, userId }));

const seedUsers: SeedUser[] = [
  {
    name: "System Admin",
    email: "admin@finance.local",
    password: "Admin@123",
    role: "ADMIN",
    status: "ACTIVE"
  },
  {
    name: "Finance Analyst",
    email: "analyst@finance.local",
    password: "Analyst@123",
    role: "ANALYST",
    status: "ACTIVE"
  },
  {
    name: "Finance Viewer",
    email: "viewer@finance.local",
    password: "Viewer@123",
    role: "VIEWER",
    status: "ACTIVE"
  }
];

const transactionProfiles: Record<SeedUser["role"], TransactionProfile> = {
  ADMIN: {
    salaryBase: 80000,
    freelanceA: 4500,
    freelanceB: 6200,
    rent: 18000,
    groceries: 7200,
    transport: 3100,
    utilities: 2400,
    insurance: 5100,
    shopping: 6700,
    entertainment: 4300
  },
  ANALYST: {
    salaryBase: 62000,
    freelanceA: 2800,
    freelanceB: 3900,
    rent: 14000,
    groceries: 5600,
    transport: 2400,
    utilities: 2100,
    insurance: 3600,
    shopping: 4200,
    entertainment: 2900
  },
  VIEWER: {
    salaryBase: 42000,
    freelanceA: 1200,
    freelanceB: 1800,
    rent: 10000,
    groceries: 3900,
    transport: 1800,
    utilities: 1500,
    insurance: 2200,
    shopping: 2600,
    entertainment: 1700
  }
};

async function main() {
  for (const seedUser of seedUsers) {
    let user = await prisma.user.findUnique({
      where: { email: seedUser.email }
    });

    if (!user) {
      const password = await bcrypt.hash(seedUser.password, 10);
      user = await prisma.user.create({
        data: {
          name: seedUser.name,
          email: seedUser.email,
          password,
          role: seedUser.role,
          status: seedUser.status
        }
      });
      console.log(`${seedUser.role} user seeded: ${seedUser.email} / ${seedUser.password}`);
    } else {
      console.log(`${seedUser.role} user already exists: ${seedUser.email}`);
    }

    const transactionCount = await prisma.transaction.count({
      where: { userId: user.id }
    });

    if (transactionCount > 0) {
      console.log(`Dummy transactions already exist for ${seedUser.email}. Skipping transaction seed.`);
      continue;
    }

    await prisma.transaction.createMany({
      data: buildDummyTransactions(user.id, transactionProfiles[seedUser.role])
    });

    console.log(`Dummy transactions seeded for ${seedUser.email}.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
