// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
// import { createToken } from "@/lib/auth";
// import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.isVerified) {
      return NextResponse.json(
        {
          error: "Please verify your email before logging in",
          isVerificationError: true,
          email: user.email,
        },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // const token = await createToken({
    //   userId: user._id,
    //   email: user.email,
    //   name: user.name,
    //   isVerified: user.isVerified
    // });

    // await cookies().set('auth-token', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    //   path: '/',
    //   maxAge: 60 * 60 * 24 // 24 hours
    // });

    // Create JWT token
    console.log("Login route user:::"+ user);
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.name,
        isVerified: user.isVerified,
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
