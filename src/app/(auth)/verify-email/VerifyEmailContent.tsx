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
import { CheckCircleIcon, CrossIcon } from "lucide-react";

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
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
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
          <Box sx={{ my: 4 }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6">Verifying your email...</Typography>
          </Box>
        )}

        {status === "success" && (
          <Box sx={{ my: 4 }}>
            <CheckCircleIcon
              color="success"
              //   className={ "fontSize"= 48, "mb"= 2 }
            />
            <Typography variant="h6" color="success.main" gutterBottom>
              Email Verified!
            </Typography>
            <Typography color="text.secondary" paragraph>
              {message}
            </Typography>
            <Typography color="text.secondary">
              Redirecting to login page...
            </Typography>
          </Box>
        )}

        {status === "error" && (
          <Box sx={{ my: 4 }}>
            <CrossIcon
              color="error"
              //   sx={{ fontSize: 48, mb: 2 }}
            />
            <Typography variant="h6" color="error" gutterBottom>
              Verification Failed
            </Typography>
            <Typography color="error" paragraph>
              {message}
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push("/login")}
              sx={{ mt: 2 }}
            >
              Return to Login
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
