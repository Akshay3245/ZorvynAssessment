import { Router } from "express";
import { userController } from "../controllers/userController";
import { authenticate } from "../middleware/authMiddleware";
import { authorizeRoles } from "../middleware/rbacMiddleware";
import { validate } from "../middleware/validate";
import {
  createUserSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  userListQuerySchema,
  userParamsSchema
} from "../schemas/userSchemas";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

router.get("/", validate(userListQuerySchema, "query"), asyncHandler(userController.list));
router.post("/", validate(createUserSchema), asyncHandler(userController.create));
router.patch(
  "/:id/role",
  validate(userParamsSchema, "params"),
  validate(updateUserRoleSchema),
  asyncHandler(userController.updateRole)
);
router.patch(
  "/:id/status",
  validate(userParamsSchema, "params"),
  validate(updateUserStatusSchema),
  asyncHandler(userController.updateStatus)
);

export default router;
