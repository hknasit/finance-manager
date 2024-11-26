/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/transactions/monthly/[year]/[month]/route.ts

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Transaction from "@/models/transaction.model";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

interface Params {
  params: Promise<{
    year: number;
    month: number;
  }>;
}

export async function GET(request: NextRequest, params: Params) {
  try {
    // Validate year and month parameters first
    const { year, month } = await params.params;

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Invalid year or month parameter" },
        { status: 400 }
      );
    }

    // Get and verify auth token
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Convert userId to ObjectId
    const userId = new mongoose.Types.ObjectId(decoded.id);

    // Calculate start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Ensure database connection
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Fetch transactions
    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: -1 })
      .lean()
      .then((docs) => JSON.parse(JSON.stringify(docs)));

    return NextResponse.json(transactions);
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
