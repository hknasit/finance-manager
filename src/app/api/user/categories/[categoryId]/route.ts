/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/user/categories/[categoryId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { verifyAuth } from "@/lib/auth";

type Context = {
  params: { categoryId: string };
};

// PATCH - Update a category
export async function PATCH(req: NextRequest, context: Context) {
  try {
    const payload = await verifyAuth();
    await connectDB();
    const userId = payload.id;
    const { categoryId } = await context.params;
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

    // Find and update the category
    const categoryIndex = user.categories.findIndex(
      (cat) => cat._id.toString() === categoryId
    );

    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Replace space with "-" and trim
    const categoryName = name.replace(/\s+/g, "-").trim();

    // Check for duplicate names, excluding the current category
    const isDuplicate = user.categories.some(
      (cat, index) =>
        index !== categoryIndex &&
        cat.name.toLowerCase() === categoryName.toLowerCase() &&
        cat.type === type
    );

    if (isDuplicate) {
      return NextResponse.json(
        { error: "Category name already exists" },
        { status: 400 }
      );
    }

    user.categories[categoryIndex] = {
      ...user.categories[categoryIndex],
      name: categoryName,
      type,
    };
    await user.save();

    return NextResponse.json({ categories: user.categories });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a category
export async function DELETE(req: NextRequest, context: Context) {
  try {
    const payload = await verifyAuth();
    await connectDB();
    const userId = payload.id;
    const { categoryId } = context.params;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const categoryIndex = user.categories.findIndex(
      (cat) => cat._id.toString() === categoryId
    );

    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Remove the category
    user.categories.splice(categoryIndex, 1);
    await user.save();

    return NextResponse.json({ categories: user.categories });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
