/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction, { ITransaction } from "@/models/transaction.model";
import { verifyAuth } from "@/lib/auth";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { GoogleSheetsService } from "@/lib/googleSheets";
import User from "@/models/user.model";
import { UserPreference } from "@/models/user-preferences.model";

// Updated validation schema to include image
const TransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string(),
  amount: z.number().positive(),
  description: z.string(),
  date: z.string(),
  paymentMethod: z.enum(["card", "cash"]),
  image: z.object({
    publicId: z.string(),
    url: z.string(),
    thumbnailUrl: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
    format: z.string().optional(),
  }).nullable().optional(),
  currentCashBalance: z.number(),
  currentBankBalance: z.number(),
});




export async function POST(req: NextRequest) {
  try {
    const authPayload = await verifyAuth();
    const userId = authPayload.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { 
      type, 
      category, 
      amount, 
      description, 
      date, 
      paymentMethod,
      image,
      currentCashBalance,
      currentBankBalance 
    } = body;

    // Convert values to numbers and validate
    const numAmount = Number(amount);
    const numCashBalance = Number(currentCashBalance);
    const numBankBalance = Number(currentBankBalance);

    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { message: "Invalid amount" },
        { status: 400 }
      );
    }

    if (isNaN(numCashBalance) || isNaN(numBankBalance)) {
      return NextResponse.json(
        { message: "Invalid balance values" },
        { status: 400 }
      );
    }

    // Calculate new balances
    let newCashBalance = numCashBalance;
    let newBankBalance = numBankBalance;

    if (paymentMethod === 'cash') {
      newCashBalance = type === 'income' 
        ? numCashBalance + numAmount 
        : numCashBalance - numAmount;
    } else {
      newBankBalance = type === 'income'
        ? numBankBalance + numAmount
        : numBankBalance - numAmount;
    }

    // Update user preferences
    await UserPreference.findOneAndUpdate(
      { user: userId },
      { 
        $set: { 
          cashBalance: newCashBalance,
          bankBalance: newBankBalance
        } 
      },
      { new: true }
    );

    const newTransaction = await Transaction.create({
      user: userId,
      type,
      category,
      amount: numAmount,
      description,
      date: new Date(date),
      paymentMethod,
      image // Add the image data to the transaction
    });

    return NextResponse.json({
      message: "Transaction saved successfully",
      transaction: newTransaction,
      balances: {
        cashBalance: newCashBalance,
        bankBalance: newBankBalance
      }
    });

  } catch (error) {
    console.error("Transaction error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function GET(req: Request) {
  try {
    const authPayload = await verifyAuth();
    const userId = authPayload.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const transactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(50);

    const userPreferences = await UserPreference.findOne({ user: userId });

    return NextResponse.json({ 
      transactions,
      balances: {
        cashBalance: userPreferences?.cashBalance || 0,
        bankBalance: userPreferences?.bankBalance || 0
      }
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { message: "Error fetching transactions" },
      { status: 500 }
    );
  }
}
