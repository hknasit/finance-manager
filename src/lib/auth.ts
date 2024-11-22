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

interface tokenPayload {
  username: string;
  email: string;
  id: string;
}

/**
 * Verifies the authentication token from the cookies
 * @throws {Error} if no token is found or if the token is invalid
 * @returns {Promise<Object>} the payload of the verified token
 */
export async function verifyAuth(): Promise<tokenPayload> {
  const cookiesObject = await cookies();
  const token = cookiesObject.get("auth-token");

  if (!token?.value) {
    throw new Error("No token found");
  }

  try {
    const verified = await jwtVerify(token.value, JWT_SECRET);
    const payload = verified.payload as unknown as tokenPayload;
    return payload;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

// Middleware to protect API routes
export async function withAuth(handler: Function) {
  return async (req: Request, context?: any) => {
    try {
      const payload = await verifyAuth();
      // Pass both request and context to the handler
      return handler(req, payload, context);
    } catch (error) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}
