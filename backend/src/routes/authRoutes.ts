import { Router } from "express";
import { authController } from "../controllers/authController";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../schemas/authSchemas";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

const methodNotAllowedMessage = (endpoint: "/login" | "/register") => ({
  message: `Method not allowed. Use POST /api/auth${endpoint} with JSON body.`
});

router.get("/register", (_req, res) => {
  return res.status(405).json(methodNotAllowedMessage("/register"));
});

router.get("/login", (_req, res) => {
  return res.status(405).json(methodNotAllowedMessage("/login"));
});

router.post("/register", validate(registerSchema), asyncHandler(authController.register));
router.post("/login", validate(loginSchema), asyncHandler(authController.login));

export default router;
