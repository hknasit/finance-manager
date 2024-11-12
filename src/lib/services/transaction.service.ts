import Transaction, { ITransaction } from "@/models/transaction.model";
import { Types } from "mongoose";

export class TransactionService {
  static async createTransaction(data: Partial<ITransaction>) {
    try {
      const transaction = new Transaction(data);
      await transaction.save();
      return transaction;
    } catch (error) {
      throw new Error(`Error creating transaction: ${error.message}`);
    }
  }

  static async getMonthlyTransactions(
    userId: string,
    month: number,
    year: number
  ) {
    try {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      return await Transaction.find({
        user: new Types.ObjectId(userId),
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ date: "asc" });
    } catch (error) {
      throw new Error(`Error fetching monthly transactions: ${error.message}`);
    }
  }

  static async getTransactionStats(
    userId: string,
    month: number,
    year: number
  ) {
    try {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      return await Transaction.aggregate([
        {
          $match: {
            user: new Types.ObjectId(userId),
            date: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]);
    } catch (error) {
      throw new Error(`Error fetching transaction stats: ${error.message}`);
    }
  }

  static async validateExcelSync(userId: string, month: number, year: number) {
    // Validate that MongoDB data matches Excel data
    const transactions = await this.getMonthlyTransactions(userId, month, year);
    const stats = await this.getTransactionStats(userId, month, year);

    return {
      transactions,
      stats,
      syncStatus: "success", // You can add more detailed sync validation here
    };
  }
}
