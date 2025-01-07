/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/verify-email?token=${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setStatus("success");
      setMessage(data.message);

      // Redirect to login after successful verification
      setTimeout(() => {
        router.push("/login?verified=true");
      }, 3000);
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Failed to verify email");
    }
  };

  return (
    <Card sx={{ width: "100%", maxWidth: 480, boxShadow: 1 }}>
      <CardContent sx={{ p: 4, textAlign: "center" }}>
        {status === "loading" && (
            <Box>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography>Verifying your email...</Typography>
            </Box>
          )}

          {status === "error" && (
            <Box>
              <AlertCircle size={48} color="red" style={{ marginBottom: 16 }} />
              <Typography variant="h5" color="error" gutterBottom>
                Verification Failed
              </Typography>
              <Typography color="error.main" sx={{ mb: 3 }}>
                {JSON.stringify(message)}
              </Typography>
              <Button variant="contained" onClick={() => router.push("/login")}>
                Return to Login
              </Button>
            </Box>
          )}

          {status === "success" && (
            <Box>
              <CheckCircle
                size={48}
                color="green"
                style={{ marginBottom: 16 }}
              />
              <Typography variant="h5" color="success.main" gutterBottom>
                Email Verified Successfully
              </Typography>
              <Typography color="text.secondary">
                Redirecting to login page...
              </Typography>
            </Box>
          )}

      </CardContent>
    </Card>
  );
}
