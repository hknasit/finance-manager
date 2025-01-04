'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/verify-email?token=${token}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setStatus('success');
      setMessage(data.message);

      // Redirect to login after successful verification
      setTimeout(() => {
        router.push('/login?verified=true');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Failed to verify email');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
        {status === 'loading' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Verifying your email...</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}

        {status === 'success' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-green-600">Email Verified!</h2>
            <p className="mb-4">{message}</p>
            <p className="text-gray-600">Redirecting to login page...</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-red-600">Verification Failed</h2>
            <p className="mb-4 text-red-600">{message}</p>
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Return to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}