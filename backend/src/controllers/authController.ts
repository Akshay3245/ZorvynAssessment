import { Request, Response } from "express";
import { LoginInput, RegisterInput } from "../schemas/authSchemas";
import { authService } from "../services/authService";

export const authController = {
  async register(req: Request, res: Response) {
    const payload = req.body as RegisterInput;
    const result = await authService.register(payload);
    return res.status(201).json({
      message: "User registered successfully",
      data: result
    });
  },

  async login(req: Request, res: Response) {
    const payload = req.body as LoginInput;
    const result = await authService.login(payload);
    return res.status(200).json({
      message: "Login successful",
      data: result
    });
  }
};
