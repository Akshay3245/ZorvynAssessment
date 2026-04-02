import { Request, Response } from "express";
import { CreateTransactionInput, TransactionQueryInput, UpdateTransactionInput } from "../schemas/transactionSchemas";
import { transactionService } from "../services/transactionService";
import { getRequestUser } from "../utils/requestUser";

export const transactionController = {
  async create(req: Request, res: Response) {
    const user = getRequestUser(req);
    const payload = req.body as CreateTransactionInput;
    const transaction = await transactionService.create(user, payload);

    return res.status(201).json({
      message: "Transaction created successfully",
      data: transaction
    });
  },

  async list(req: Request, res: Response) {
    const user = getRequestUser(req);
    const query = req.query as unknown as TransactionQueryInput;
    const result = await transactionService.list(user, query);

    return res.status(200).json({
      message: "Transactions fetched successfully",
      ...result
    });
  },

  async getById(req: Request, res: Response) {
    const user = getRequestUser(req);
    const transaction = await transactionService.getById(req.params.id, user);

    return res.status(200).json({
      message: "Transaction fetched successfully",
      data: transaction
    });
  },

  async update(req: Request, res: Response) {
    const user = getRequestUser(req);
    const payload = req.body as UpdateTransactionInput;
    const transaction = await transactionService.update(req.params.id, user, payload);

    return res.status(200).json({
      message: "Transaction updated successfully",
      data: transaction
    });
  },

  async remove(req: Request, res: Response) {
    const user = getRequestUser(req);
    await transactionService.remove(req.params.id, user);

    return res.status(200).json({
      message: "Transaction deleted successfully"
    });
  }
};
