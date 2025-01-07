/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense } from "react";

import { Box, Container, CircularProgress } from "@mui/material";
import VerifyEmailContent from "./VerifyEmailContent";

export default function VerifyEmail() {
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box
        sx={{
          textAlign: "center",
          p: 4,
          bgcolor: "background.paper",
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <Suspense
          fallback={
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "200px",
              }}
            >
              <CircularProgress />
            </Box>
          }
        >
          
          <VerifyEmailContent />
        </Suspense>
      </Box>
    </Container>
  );
}
