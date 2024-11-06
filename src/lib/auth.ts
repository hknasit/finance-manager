/* eslint-disable @typescript-eslint/no-unused-vars */
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/user.model";

export async function getCurrentUser() {
  try {
    const token = (await cookies()).get("token");
    if (!token) return null;

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const user = await User.findById(decoded.userId).select("-password");
    return user;
  } catch (error) {
    return null;
  }
}
