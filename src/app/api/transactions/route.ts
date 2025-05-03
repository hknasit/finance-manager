// app/api/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Transaction from "@/models/transaction.model";
import { verifyAuth } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Transaction as TransactionType } from "@/types/transaction";

// Interface for filter query
interface TransactionFilterQuery {
  user: mongoose.Types.ObjectId;
  type?: 'income' | 'expense';
  category?: string;
  paymentMethod?: 'card' | 'cash';
  date?: {
    $gte?: Date;
    $lte?: Date;
  };
}

// Interface for pagination
interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalTransactions: number;
  hasMore: boolean;
  limit: number;
}

// Response data structure
interface TransactionResponse {
  transactions: TransactionType[];
  pagination: PaginationData;
  totals: {
    totalIncome: number;
    totalExpense: number;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<TransactionResponse | { error: string; details?: string }>> {
  try {
    // Connect to DB first to reduce connection overhead
    await connectDB();

    // Get pagination parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1')); 
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25')));
    const skip = (page - 1) * limit;

    // Get filter parameters (with sanitization)
    const type = searchParams.get('type')?.trim();
    const category = searchParams.get('category')?.trim();
    const paymentMethod = searchParams.get('paymentMethod')?.trim();
    const startDate = searchParams.get('startDate')?.trim();
    const endDate = searchParams.get('endDate')?.trim();

    // Get and verify auth token
    const token = await verifyAuth();
    
    // Convert userId to ObjectId
    const userId = new mongoose.Types.ObjectId(token.id);

    // Build filter query
    const filterQuery: TransactionFilterQuery = { user: userId };

    // Add date range filter if provided
    if (startDate || endDate) {
      filterQuery.date = {};
      if (startDate) {
        const startOfDay = new Date(startDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        filterQuery.date.$gte = startOfDay;
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        filterQuery.date.$lte = endOfDay;
      }
    }

    // Add other filters (only if valid values)
    if (type && type !== 'all') {
      if (type === 'income' || type === 'expense') {
        filterQuery.type = type;
      }
    }
    
    if (category && category !== 'all') {
      filterQuery.category = category;
    }
    
    if (paymentMethod && paymentMethod !== 'all') {
      if (paymentMethod === 'card' || paymentMethod === 'cash') {
        filterQuery.paymentMethod = paymentMethod;
      }
    }

    // Run queries in parallel for better performance
    const [totalTransactions, transactions, totals] = await Promise.all([
      Transaction.countDocuments(filterQuery),
      Transaction.find(filterQuery)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.aggregate<{ _id: null; totalIncome: number; totalExpense: number }>([
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
      ])
    ]);

    const totalPages = Math.ceil(totalTransactions / limit);
    const totalsData = totals[0] || { totalIncome: 0, totalExpense: 0 };

    // Convert to plain objects and handle date serialization
    const serializedTransactions = JSON.parse(JSON.stringify(transactions)) as TransactionType[];

    return NextResponse.json({
      transactions: serializedTransactions,
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
    }, {
      headers: {
        'Cache-Control': 'private, max-age=10' // Cache for 10 seconds for authenticated users
      }
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
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