'use client';

import { Suspense } from 'react';
import VerifyEmailContent from './VerifyEmailContent';
import { CircularProgress, Container, Box } from '@mui/material';

export default function VerifyEmailPage() {
  return (
    <Container 
      maxWidth={false}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Suspense
        fallback={
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px' 
            }}
          >
            <CircularProgress />
          </Box>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </Container>
  );
}