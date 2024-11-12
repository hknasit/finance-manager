/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createToken(payload: any) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  // Set cookie
  (
    await // Set cookie
    cookies()
  ).set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return token;
}

export async function verifyAuth() {
  const cookiesObject = await cookies(); // Await the cookies() if it's asynchronous
  const token = cookiesObject.get("auth-token");

  if (!token?.value) {
    throw new Error("No token found");
  }

  try {
    const verified = await jwtVerify(token.value, JWT_SECRET);
    return verified.payload;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

// Middleware to protect API routes
export async function withAuth(handler: Function) {
  return async (req: Request) => {
    try {
      const payload = await verifyAuth();
      return handler(req, payload);
    } catch (error) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}
