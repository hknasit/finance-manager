/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
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

// Transaction validation schema
const TransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string(),
  amount: z.number().positive(),
  description: z.string(),
  date: z.string(),
  paymentMethod: z.enum(["card", "cash"]),
});

const userDataDir = path.join(process.cwd(), "data", "users"); // Define paths globally

async function ensureDirectoryExists(dirPath: string) {
  try {
    await fs.promises.stat(dirPath);
  } catch (error) {
    await fs.promises.mkdir(dirPath, { recursive: true });
  }
}

async function getOrCreateWorkbook(userId: string): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  const filePath = path.join(userDataDir, `${userId}.xlsx`);

  try {
    await fs.promises.access(filePath);
    await workbook.xlsx.readFile(filePath);
  } catch (error) {
    console.log("Creating new Excel file for user");
    await ensureDirectoryExists(userDataDir);
    await initializeUserExcel(userId);
    await workbook.xlsx.readFile(filePath);
  }

  return workbook;
}

export async function POST(req: Request) {
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

    // Validate resulting balances aren't negative
    if (newCashBalance < 0 || newBankBalance < 0) {
      return NextResponse.json(
        { message: "Insufficient balance" },
        { status: 400 }
      );
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
      paymentMethod
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

async function initializeUserExcel(userId: string) {
  const workbook = new ExcelJS.Workbook();
  const userDataDir = path.join(process.cwd(), "data", "users");
  const filePath = path.join(userDataDir, `${userId}.xlsx`);

  // Ensure the directory exists
  await ensureDirectoryExists(userDataDir);

  // Create Dashboard
  const dashboard = workbook.addWorksheet("Dashboard");
  setupDashboard(dashboard);

  // Create Monthly Sheets
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  months.forEach((month) => {
    const sheet = workbook.addWorksheet(month);
    setupMonthlySheet(sheet);
  });

  try {
    await workbook.xlsx.writeFile(filePath);
    console.log("Excel file created successfully");
  } catch (error) {
    console.error("Error creating Excel file:", error);
    throw error;
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

/**
 * Sets up the Dashboard worksheet
 *
 * The Dashboard worksheet is used to display the gross income, credit bill, donation, rent, food, miscellaneous, monthly expense, and net income for each month.
 *
 * @param {ExcelJS.Worksheet} sheet - The worksheet to set up
 */
function setupDashboard(sheet: ExcelJS.Worksheet) {
  // Set up columns
  sheet.columns = [
    { header: "Month", key: "month", width: 15 },
    { header: "Gross Income", key: "grossIncome", width: 15 },
    { header: "Credit Bill", key: "creditBill", width: 15 },
    { header: "Donation", key: "donation", width: 15 },
    { header: "Rent", key: "rent", width: 15 },
    { header: "Food", key: "food", width: 15 },
    { header: "Miscellaneous", key: "misc", width: 15 },
    { header: "Monthly Expense", key: "monthlyExpense", width: 15 },
    { header: "Net Income", key: "netIncome", width: 15 },
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  months.forEach((month, index) => {
    const rowNumber = index + 2;
    const row = sheet.getRow(rowNumber);

    // Set month name
    row.getCell(1).value = month;

    // Set formulas using named references
    row.getCell(2).value = { formula: `'${month}'!$C$1`, result: 0 }; // Gross Income
    row.getCell(3).value = { formula: `'${month}'!$D$1`, result: 0 }; // Credit Bill
    row.getCell(4).value = { formula: `'${month}'!$E$1`, result: 0 }; // Donation
    row.getCell(5).value = { formula: `'${month}'!$F$1`, result: 0 }; // Rent
    row.getCell(6).value = { formula: `'${month}'!$G$1`, result: 0 }; // Food
    row.getCell(7).value = { formula: `'${month}'!$H$1`, result: 0 }; // Misc
    row.getCell(8).value = {
      formula: `SUM(C${rowNumber}:G${rowNumber})`,
      result: 0,
    }; // Monthly Expense
    row.getCell(9).value = {
      formula: `B${rowNumber}-H${rowNumber}`,
      result: 0,
    }; // Net Income

    // Apply number format
    for (let i = 2; i <= 9; i++) {
      row.getCell(i).numFmt = "#,##0.00";
    }

    row.commit();
  });
  const row = sheet.getRow(14);
  row.getCell(9).value = { formula: `SUM(I2:I13)`, result: 0 };
  row.getCell(9).numFmt = "#,##0.00";
  row.commit();
}

function setupMonthlySheet(sheet: ExcelJS.Worksheet) {
  // Set up columns
  sheet.columns = [
    { header: "Details", key: "details", width: 30 },
    { header: "Date", key: "date", width: 15 },
    { header: "Income", key: "income", width: 15 },
    { header: "Credit Bill", key: "creditBill", width: 15 },
    { header: "Donation", key: "donation", width: 15 },
    { header: "Rent", key: "rent", width: 15 },
    { header: "Food", key: "food", width: 15 },
    { header: "Miscellaneous", key: "misc", width: 15 },
  ];

  // Add total formulas in row 1
  const totalRow = sheet.getRow(1);
  totalRow.getCell(1).value = "TOTAL";
  totalRow.getCell(2).value = "";

  // Set formulas for totals with explicit ranges starting from row 2
  totalRow.getCell(3).value = { formula: "SUBTOTAL(9,C2:C1048576)", result: 0 }; // Income
  totalRow.getCell(4).value = { formula: "SUBTOTAL(9,D2:D1048576)", result: 0 }; // Credit Bill
  totalRow.getCell(5).value = { formula: "SUBTOTAL(9,E2:E1048576)", result: 0 }; // Donation
  totalRow.getCell(6).value = { formula: "SUBTOTAL(9,F2:F1048576)", result: 0 }; // Rent
  totalRow.getCell(7).value = { formula: "SUBTOTAL(9,G2:G1048576)", result: 0 }; // Food
  totalRow.getCell(8).value = { formula: "SUBTOTAL(9,H2:H1048576)", result: 0 }; // Misc

  // Format numbers in total row
  for (let i = 3; i <= 8; i++) {
    totalRow.getCell(i).numFmt = "#,##0.00";
  }

  // Make the total row bold
  totalRow.font = { bold: true };
  totalRow.commit();
}

// Add this helper function to format cells after adding new transactions
function formatTransactionRow(row: ExcelJS.Row) {
  // Format date cell
  row.getCell(2).numFmt = "yyyy-mm-dd";

  // Format number cells
  for (let i = 3; i <= 8; i++) {
    row.getCell(i).numFmt = "#,##0.00";
  }

  row.commit();
}

async function addTransactionToSheet(
  sheet: ExcelJS.Worksheet,
  transaction: ITransaction
) {
  const transactionDate = new Date(transaction.date);

  // Add row after the total row (row 1)
  const rowValues = [
    transaction.description,
    transactionDate.toISOString().split("T")[0],
    transaction.type === "income" ? transaction.amount : null,
    transaction.category === "Credit Bill" ? transaction.amount : null,
    transaction.category === "Donation" ? transaction.amount : null,
    transaction.category === "Rent" ? transaction.amount : null,
    transaction.category === "Food" ? transaction.amount : null,
    transaction.category === "Miscellaneous" ? transaction.amount : null,
  ];

  // Insert the new row at position 2 (right after the totals)
  const newRow = sheet.insertRow(2, rowValues);
  formatTransactionRow(newRow);
  newRow.commit();
}
