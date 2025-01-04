'use client';
import React, { useState } from 'react';

interface UnverifiedEmailProps {
  email: string;
  onDismiss: () => void;
}

export function UnverifiedEmail({ email, onDismiss }: UnverifiedEmailProps) {
  const [isResending, setIsResending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const resendVerificationEmail = async () => {
    try {
      setIsResending(true);
      setStatus('idle');
      setMessage('');

      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setStatus('success');
      setMessage('Verification email sent successfully! Please check your inbox.');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
      <div className="flex">
        <div className="flex-shrink-0">
          {/* Warning Icon */}
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-800">
            Your email address ({email}) needs to be verified before you can log in.
            Please check your inbox for the verification link.
          </p>
          
          {status === 'success' && (
            <p className="mt-2 text-sm text-green-600 font-medium">{message}</p>
          )}
          
          {status === 'error' && (
            <p className="mt-2 text-sm text-red-600 font-medium">{message}</p>
          )}

          <div className="mt-4 flex gap-3">
            <button
              onClick={resendVerificationEmail}
              disabled={isResending}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </button>
            <button
              onClick={onDismiss}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}