// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "@/models/user.model";
import { connectDB } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        username: user.name,
        email: user.email,
        id: user._id,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" } // Token expires in 24 hours
    );
    const response = NextResponse.json({ token, message: "Login successful" });

    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: false,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
