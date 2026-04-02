import { Router } from "express";
import { transactionController } from "../controllers/transactionController";
import { authenticate } from "../middleware/authMiddleware";
import { authorizeRoles } from "../middleware/rbacMiddleware";
import { validate } from "../middleware/validate";
import {
  createTransactionSchema,
  transactionParamsSchema,
  transactionQuerySchema,
  updateTransactionSchema
} from "../schemas/transactionSchemas";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.get("/", validate(transactionQuerySchema, "query"), asyncHandler(transactionController.list));
router.get("/:id", validate(transactionParamsSchema, "params"), asyncHandler(transactionController.getById));

router.post(
  "/",
  authorizeRoles("ADMIN", "ANALYST"),
  validate(createTransactionSchema),
  asyncHandler(transactionController.create)
);

router.put(
  "/:id",
  authorizeRoles("ADMIN", "ANALYST"),
  validate(transactionParamsSchema, "params"),
  validate(updateTransactionSchema),
  asyncHandler(transactionController.update)
);

router.delete(
  "/:id",
  authorizeRoles("ADMIN", "ANALYST"),
  validate(transactionParamsSchema, "params"),
  asyncHandler(transactionController.remove)
);

export default router;
