/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface VerifyEmailContentProps {
  token: string;
}

export default function VerifyEmailContent({ token }: VerifyEmailContentProps) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing");
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/verify-email/${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setStatus("success");
      setMessage(data.message);

      // Redirect to login after successful verification
      setTimeout(() => {
        router.push("/login?message=Your account is verified");
      }, 2000);
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Failed to verify email");
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center text-center">
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-6">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
          <p className="text-gray-700 font-medium">Verifying your email...</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center justify-center py-4">
          <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
          <h3 className="text-xl font-bold text-red-600 mb-2">Verification Failed</h3>
          <p className="text-red-600 mb-6">{message}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Return to Login
          </button>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center justify-center py-4">
          <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
          <h3 className="text-xl font-bold text-green-600 mb-2">Email Verified Successfully</h3>
          <p className="text-gray-600">Redirecting to login page...</p>
        </div>
      )}
    </div>
  );
}