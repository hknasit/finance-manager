import mongoose, { Schema } from "mongoose";

export interface ITransaction {
  user: mongoose.Types.ObjectId;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  date: Date;
  paymentMethod: "card" | "cash";
}

const transactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true, enum: ["income", "expense"] },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    paymentMethod: { type: String, required: true, enum: ["card", "cash"] },
  },
  {
    timestamps: true,
  }
);

const Transaction = (mongoose.models.Transaction ||
  mongoose.model<ITransaction>(
    "Transaction",
    transactionSchema
  )) as mongoose.Model<ITransaction>;

export default Transaction;
