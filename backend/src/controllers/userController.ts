import { Request, Response } from "express";
import { CreateUserInput, UpdateUserRoleInput, UpdateUserStatusInput, UserListQueryInput } from "../schemas/userSchemas";
import { userService } from "../services/userService";
import { getRequestUser } from "../utils/requestUser";

export const userController = {
  async list(req: Request, res: Response) {
    const query = req.query as unknown as UserListQueryInput;
    const result = await userService.list(query);

    return res.status(200).json({
      message: "Users fetched successfully",
      ...result
    });
  },

  async create(req: Request, res: Response) {
    const payload = req.body as CreateUserInput;
    const user = await userService.create(payload);

    return res.status(201).json({
      message: "User created successfully",
      data: user
    });
  },

  async updateRole(req: Request, res: Response) {
    const requestingUser = getRequestUser(req);
    const payload = req.body as UpdateUserRoleInput;
    const user = await userService.updateRole(req.params.id, requestingUser, payload);

    return res.status(200).json({
      message: "User role updated successfully",
      data: user
    });
  },

  async updateStatus(req: Request, res: Response) {
    const requestingUser = getRequestUser(req);
    const payload = req.body as UpdateUserStatusInput;
    const user = await userService.updateStatus(req.params.id, requestingUser, payload);

    return res.status(200).json({
      message: "User status updated successfully",
      data: user
    });
  }
};
