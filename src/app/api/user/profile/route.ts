import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserPreference } from "@/models/user-preferences.model";
import User from "@/models/user.model";
import { verifyAuth } from "@/lib/auth";

export async function GET() {
  try {
    const verified = await verifyAuth();
    if (!verified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get user preferences
    const preferences = await UserPreference.findOne({ user: verified.id });

    return NextResponse.json({
      name: verified.username,
      email: verified.email,
      currency: preferences?.currency || "USD",
      cashBalance: preferences?.cashBalance || 0,
      defaultTransactionType: preferences?.defaultTransactionType || "expense",
      defaultPaymentMethod: preferences?.defaultPaymentMethod || "card",
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const verified = await verifyAuth();
    if (!verified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    // Update user's name in the User collection
    const updatedUser = await User.findByIdAndUpdate(
      verified.id,
      { name: data.name },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update or create preferences with the verified user's ID
    const updatedPreferences = await UserPreference.findOneAndUpdate(
      { user: verified.id },
      {
        user: verified.id,
        currency: data.currency,
        cashBalance: data.cashBalance,
        defaultTransactionType: data.defaultTransactionType,
        defaultPaymentMethod: data.defaultPaymentMethod,
      },
      { upsert: true, new: true }
    );

    if (!updatedPreferences) {
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      data: {
        name: updatedUser.name,
        email: verified.email,
        ...updatedPreferences.toObject(),
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}