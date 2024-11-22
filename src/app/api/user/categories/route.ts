/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/user/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { verifyAuth } from "@/lib/auth";

// GET - Fetch all categories
export async function GET() {
  try {
    const payload = await verifyAuth();
    await connectDB();
    const userId = payload.id;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ categories: user.categories || [] });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
};

// POST - Add new category
export async function POST(req: NextRequest) {
  try {
    const payload = await verifyAuth();
    await connectDB();

    const userId = payload.id;
    const { name, type } = await req.json();

    // Validate input
    if (!name?.trim() || !["income", "expense"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid category data" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for duplicate category names
    const isDuplicate = user.categories?.some(
      (cat) =>
        cat.name.toLowerCase() === name.toLowerCase() && cat.type === type
    );

    if (isDuplicate) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 }
      );
    }

    // Add new category
    user.categories = user.categories || [];
    user.categories.push({ name: name.trim(), type });
    await user.save();

    return NextResponse.json({ categories: user.categories });
  } catch (error) {
    console.error("Error adding category:", error);
    if (
      error.message === "Unauthorized" ||
      error.message === "No token found"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to add category" },
      { status: 500 }
    );
  }
}
