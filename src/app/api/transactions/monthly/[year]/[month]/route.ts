/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/transactions/monthly/[year]/[month]/route.ts

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Transaction from "@/models/transaction.model";
import { verifyAuth } from "@/lib/auth";
import connectDB from "@/lib/db";

interface Params {
  params: Promise<{
    year: number;
    month: number;
  }>;
}
export async function GET(request: NextRequest, { params }: Params) {
  try {
    // Connect to the database first
    await connectDB();

    // Parse and validate year and month
    const year =  (await params).year;
    const month =  (await params).month;

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Invalid year or month parameter" },
        { status: 400 }
      );
    }

    // Get and verify auth token
    const token = await verifyAuth();
    const userId = new mongoose.Types.ObjectId(token.id);

    // Calculate start and end dates for the month (in UTC)
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    // Build filter query
    const filterQuery = {
      user: userId,
      date: { $gte: startDate, $lte: endDate }
    };

    // Fetch all transactions for the month (no pagination for analytics)
    const transactions = await Transaction.find(filterQuery)
      .sort({ date: 1 }) // Sort by date ascending for time series
      .lean();

    // Calculate totals using aggregation for better performance
    const totals = await Transaction.aggregate([
      { $match: filterQuery },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    // Process totals into a more usable format
    const totalIncome = totals.find(t => t._id === "income")?.total || 0;
    const totalExpense = totals.find(t => t._id === "expense")?.total || 0;

    return NextResponse.json({
      transactions: JSON.parse(JSON.stringify(transactions)),
      totals: {
        totalIncome,
        totalExpense
      }
    }, {
      headers: {
        // Add cache control headers
        'Cache-Control': 'private, max-age=300' // Cache for 5 minutes
      }
    });
  } catch (error) {
    console.error("Error in monthly transactions:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? (error instanceof Error ? error.message : String(error))
            : undefined,
      },
      { status: 500 }
    );
  }
}