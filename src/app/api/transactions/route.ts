/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/transactions/route.ts

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Transaction from "@/models/transaction.model";
import { verifyAuth } from "@/lib/auth";
import connectDB from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const skip = (page - 1) * limit;

    // Get filter parameters
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const paymentMethod = searchParams.get('paymentMethod');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get and verify auth token
    const token = await verifyAuth();

    // Convert userId to ObjectId
    const userId = new mongoose.Types.ObjectId(token.id);

    // Build filter query
    const filterQuery: any = {
      user: userId
    };

    // Add date range filter if provided
    if (startDate || endDate) {
      filterQuery.date = {};
      if (startDate) {
        filterQuery.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filterQuery.date.$lte = new Date(endDate);
      }
    }

    // Add other filters
    if (type && type !== 'all') {
      filterQuery.type = type;
    }
    if (category && category !== 'all') {
      filterQuery.category = category;
    }
    if (paymentMethod && paymentMethod !== 'all') {
      filterQuery.paymentMethod = paymentMethod;
    }
    await connectDB();
    // Ensure database connection
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Get total count for pagination
    const totalTransactions = await Transaction.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalTransactions / limit);

    // Fetch transactions with pagination
    const transactions = await Transaction.find(filterQuery)
      .sort({ date: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .lean()
      .then((docs) => JSON.parse(JSON.stringify(docs)));

    // Calculate totals for the filtered data
    const totals = await Transaction.aggregate([
      { $match: filterQuery },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
            }
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
            }
          }
        }
      }
    ]);

    const totalsData = totals[0] || { totalIncome: 0, totalExpense: 0 };

    return NextResponse.json({
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalTransactions,
        hasMore: page < totalPages,
        limit
      },
      totals: {
        totalIncome: totalsData.totalIncome || 0,
        totalExpense: totalsData.totalExpense || 0
      }
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
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