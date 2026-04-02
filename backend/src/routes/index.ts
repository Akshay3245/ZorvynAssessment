import { Router } from "express";
import authRoutes from "./authRoutes";
import dashboardRoutes from "./dashboardRoutes";
import transactionRoutes from "./transactionRoutes";
import userRoutes from "./userRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/transactions", transactionRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/users", userRoutes);

export default router;
