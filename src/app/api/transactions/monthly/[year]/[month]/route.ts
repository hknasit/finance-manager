/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/transactions/monthly/[year]/[month]/route.ts

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Transaction from "@/models/transaction.model";
import { verifyAuth } from "@/lib/auth";

interface Params {
  params: Promise<{
    year: number;
    month: number;
  }>;
}

export async function GET(request: NextRequest, params: Params) {
  try {
    // Get pagination parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const skip = (page - 1) * limit;

    // Get filter parameters
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const paymentMethod = searchParams.get("paymentMethod");

    // Validate year and month parameters first
    const { year, month } = await params.params;

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Invalid year or month parameter" },
        { status: 400 }
      );
    }

    // Get and verify auth token
    const token = await verifyAuth();

    // Convert userId to ObjectId
    const userId = new mongoose.Types.ObjectId(token.id);

    // Calculate start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Build filter query
    const filterQuery: any = {
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    };

    if (type && type !== "all") {
      filterQuery.type = type;
    }
    if (category && category !== "all") {
      filterQuery.category = category;
    }
    if (paymentMethod && paymentMethod !== "all") {
      filterQuery.paymentMethod = paymentMethod;
    }

    // Ensure database connection
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Get total count for pagination
    const totalTransactions = await Transaction.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalTransactions / limit);

    // Fetch transactions with pagination
    const transactions = await Transaction.find(filterQuery)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .then((docs) => JSON.parse(JSON.stringify(docs)));

    // Calculate totals for income and expense
    const totals = await Transaction.aggregate([
      { $match: filterQuery },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
        },
      },
    ]);

    const totalsData = totals[0] || { totalIncome: 0, totalExpense: 0 };

    return NextResponse.json({
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalTransactions,
        hasMore: page < totalPages,
        limit,
      },
      totals: {
        totalIncome: totalsData.totalIncome || 0,
        totalExpense: totalsData.totalExpense || 0,
      },
    });
  } catch (error) {
    console.error("Error in monthly transactions:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}
