import { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

// Define the page metadata
export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your password",
};

// Correctly type the params to expect a Promise
interface Props {
  params: Promise<{ token: string }>;
  
}

// Make the component async to handle the Promise
export default async function ResetPasswordPage({ params }: Props) {
  // Await the params to get the token
  const { token } = await params;

  // Validate token
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-800">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid Reset Link</h2>
          <p className="text-gray-600">
            The password reset link appears to be invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
        <p className="text-gray-600 mb-6">Enter your new password below.</p>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}