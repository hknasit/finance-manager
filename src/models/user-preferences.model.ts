import mongoose from "mongoose";

const userPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    cashBalance: {
      type: Number,
      default: 0,
    },
    bankBalance: {
      type: Number,
      default: 0,
    },
    defaultTransactionType: {
      type: String,
      enum: ["income", "expense"],
      default: "expense",
    },
    defaultPaymentMethod: {
      type: String,
      enum: ["cash", "card"],
      default: "card",
    },
  },
  { timestamps: true }
);

export const UserPreference =
  mongoose.models.UserPreference ||
  mongoose.model("UserPreference", userPreferenceSchema);