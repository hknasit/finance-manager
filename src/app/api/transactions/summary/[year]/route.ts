import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Transaction from "@/models/transaction.model";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

interface JWTPayload {
  username: string;
  email: string;
  id: string; // This matches your token structure
  exp?: number;
}
interface Params {
  params: Promise<{
    year: number;
    month: number;
  }>;
}

export async function GET(request: NextRequest, parans: Params) {
  try {
    // Get and validate year parameter

    const {year} = await parans.params;
    
    console.log("Processing request for year:", year);

    if (isNaN(year) || year < 1900 || year > 2100) {
      return NextResponse.json(
        { error: "Invalid year parameter" },
        { status: 400 }
      );
    }

    // Get auth token and verify
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      console.log("User ID from token:", decoded.id);
      console.log("User email from token:", decoded.email);

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

    // Ensure database connection
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Create date range for the year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);
    console.log("Querying transactions between:", startDate, "and", endDate);

    // Convert userId string to ObjectId
    const userId = new mongoose.Types.ObjectId(decoded.id);

    // First, let's check if we have any transactions at all for this user
    const transactionCount = await Transaction.countDocuments({
      user: userId,
    });
    console.log("Total transactions found for user:", transactionCount);

    // Fetch transactions
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
          grossIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          expenses: {
            $push: {
              $cond: [
                { $eq: ["$type", "expense"] },
                {
                  category: "$category",
                  amount: "$amount",
                },
                null,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          expenses: {
            $filter: {
              input: "$expenses",
              as: "expense",
              cond: { $ne: ["$$expense", null] },
            },
          },
        },
      },
      {
        $addFields: {
          creditBill: {
            $reduce: {
              input: "$expenses",
              initialValue: 0,
              in: {
                $sum: [
                  "$$value",
                  {
                    $cond: [
                      { $eq: ["$$this.category", "Credit Bill"] },
                      "$$this.amount",
                      0,
                    ],
                  },
                ],
              },
            },
          },
          donation: {
            $reduce: {
              input: "$expenses",
              initialValue: 0,
              in: {
                $sum: [
                  "$$value",
                  {
                    $cond: [
                      { $eq: ["$$this.category", "Donation"] },
                      "$$this.amount",
                      0,
                    ],
                  },
                ],
              },
            },
          },
          rent: {
            $reduce: {
              input: "$expenses",
              initialValue: 0,
              in: {
                $sum: [
                  "$$value",
                  {
                    $cond: [
                      { $eq: ["$$this.category", "Rent"] },
                      "$$this.amount",
                      0,
                    ],
                  },
                ],
              },
            },
          },
          food: {
            $reduce: {
              input: "$expenses",
              initialValue: 0,
              in: {
                $sum: [
                  "$$value",
                  {
                    $cond: [
                      { $eq: ["$$this.category", "Food"] },
                      "$$this.amount",
                      0,
                    ],
                  },
                ],
              },
            },
          },
          miscellaneous: {
            $reduce: {
              input: "$expenses",
              initialValue: 0,
              in: {
                $sum: [
                  "$$value",
                  {
                    $cond: [
                      { $eq: ["$$this.category", "Miscellaneous"] },
                      "$$this.amount",
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          monthlyExpense: {
            $sum: [
              "$creditBill",
              "$donation",
              "$rent",
              "$food",
              "$miscellaneous",
            ],
          },
          netIncome: {
            $subtract: [
              "$grossIncome",
              {
                $sum: [
                  "$creditBill",
                  "$donation",
                  "$rent",
                  "$food",
                  "$miscellaneous",
                ],
              },
            ],
          },
          month: "$_id",
        },
      },
      {
        $project: {
          _id: 0,
          month: 1,
          grossIncome: 1,
          creditBill: 1,
          donation: 1,
          rent: 1,
          food: 1,
          miscellaneous: 1,
          monthlyExpense: 1,
          netIncome: 1,
        },
      },
      { $sort: { month: 1 } },
    ]);

    // Log the results for debugging
    console.log(
      "Query results:",
      JSON.stringify(
        {
          userId: userId.toString(),
          startDate,
          endDate,
          resultCount: monthlyData.length,
          data: monthlyData,
        },
        null,
        2
      )
    );

    if (!monthlyData || monthlyData.length === 0) {
      console.log("No data found for the specified criteria");
      return NextResponse.json([]);
    }

    return NextResponse.json(monthlyData);
  } catch (error) {
    console.error("Error in transaction summary:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
