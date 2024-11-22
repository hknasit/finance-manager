import mongoose from "mongoose";

export type CategoryType = "income" | "expense";

export interface Category {
  _id?: string;
  name: string;
  type: "income" | "expense";
}

// Define default categories that will be added for new users
export const DEFAULT_CATEGORIES: Category[] = [
  { name: "Salary", type: "income" },
  { name: "Part-time", type: "income" },
  { name: "Credit Bill", type: "expense" },
  { name: "Donation", type: "expense" },
  { name: "Rent", type: "expense" },
  { name: "Food", type: "expense" },
  { name: "Miscellaneous", type: "expense" },
];

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
  },
  categories: {
    type: [categorySchema],
    default: DEFAULT_CATEGORIES,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetToken: String,
  resetTokenExpiry: Date,
  spreadsheetId: String,
  spreadsheetUrl: String,
});

// Prevent mongoose from creating plural form of model name
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
