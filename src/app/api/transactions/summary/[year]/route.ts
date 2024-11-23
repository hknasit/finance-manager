import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Transaction from "@/models/transaction.model";
import User from "@/models/user.model";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

interface JWTPayload {
  username: string;
  email: string;
  id: string;
  exp?: number;
}

interface Params {
  params: Promise<{
    year: number;
    month: number;
  }>;
}

export async function GET(request: NextRequest, params: Params) {
  try {
    const { year } = await params.params;
    
    if (isNaN(year) || year < 1900 || year > 2100) {
      return NextResponse.json(
        { error: "Invalid year parameter" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      if (!decoded.id) {
        throw new Error("Invalid token payload");
      }
    } catch (err) {
      console.error("Token verification failed:", err);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);
    const userId = new mongoose.Types.ObjectId(decoded.id);

    // Get user's categories
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch transactions with dynamic category handling
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          transactions: {
            $push: {
              type: "$type",
              category: "$category",
              amount: "$amount",
            },
          },
          grossIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          monthlyExpense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
        },
      },
      {
        $addFields: {
          month: "$_id",
          netIncome: {
            $subtract: ["$grossIncome", "$monthlyExpense"],
          },
        },
      },
      {
        $project: {
          _id: 0,
          month: 1,
          grossIncome: 1,
          monthlyExpense: 1,
          netIncome: 1,
          transactions: 1,
        },
      },
      { $sort: { month: 1 } },
    ]);

    // Post-process to add category breakdowns
    const processedData = monthlyData.map(month => {
      const categoryTotals = {};
      
      // Initialize all expense categories with 0
      user.categories
        .filter(cat => cat.type === 'expense')
        .forEach(cat => {
          categoryTotals[cat.name] = 0;
        });

      // Sum up transactions by category
      month.transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
          categoryTotals[transaction.category] = 
            (categoryTotals[transaction.category] || 0) + transaction.amount;
        }
      });

      return {
        month: month.month,
        grossIncome: month.grossIncome || 0,
        monthlyExpense: month.monthlyExpense || 0,
        netIncome: month.netIncome || 0,
        categories: categoryTotals,
      };
    });

    // Fill in missing months with zero values
    const allMonths = Array.from({ length: 12 }, (_, index) => index + 1);
    const completeData = allMonths.map(monthNum => {
      const existingData = processedData.find(d => d.month === monthNum);
      if (existingData) return existingData;

      const emptyCategories = {};
      user.categories
        .filter(cat => cat.type === 'expense')
        .forEach(cat => {
          emptyCategories[cat.name] = 0;
        });

      return {
        month: monthNum,
        grossIncome: 0,
        monthlyExpense: 0,
        netIncome: 0,
        categories: emptyCategories,
      };
    });

    return NextResponse.json(completeData);
  } catch (error) {
    console.error("Error in transaction summary:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}