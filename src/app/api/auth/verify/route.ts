/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/auth/verify/route.ts
import { verifyAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await verifyAuth();
    return NextResponse.json({ authenticated: true });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
