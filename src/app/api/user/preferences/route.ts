/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/user/preferences/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserPreference } from "@/models/user-preferences.model";
import { cookies } from "next/headers";

// GET user preferences
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const cookiesObject = await cookies();
    const token = cookiesObject.get("auth-token");

    if (!token?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preferences = await UserPreference.findOne({
      // @ts-ignore
      user: token?.value.userId,
    })
      .lean()
      .exec();

    if (!preferences) {
      // Return default preferences if none exist
      return NextResponse.json({
        currency: "USD",
        defaultTransactionType: "expense",
        defaultPaymentMethod: "cash",
        bankBalance: 0,
        cashBalance: 0,
        theme: "light",
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Preferences fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

// UPDATE user preferences
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const cookiesObject = await cookies();
    const token = cookiesObject.get("auth-token");

    if (!token?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const preferences = await UserPreference.findOneAndUpdate(
      // @ts-ignore
      { user:token?.value.userId },
      {
        $set: {
          currency: data.currency,
          defaultTransactionType: data.defaultTransactionType,
          defaultPaymentMethod: data.defaultPaymentMethod,
          cashBalance: data.cashBalance,
          bankBalance: data.bankBalance,
          theme: data.theme,
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Preferences update error:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
