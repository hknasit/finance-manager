// ResetPasswordPage.tsx
import { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";
import { DollarSign } from "lucide-react";

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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH;

  // Validate token
  if (!token) {
    return (
      <div className="min-h-screen bg-white text-gray-800">
        <nav className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="w-6 md:w-8 h-6 md:h-8 text-green-600" />
            <span className="ml-2 text-lg md:text-xl font-bold">CashFlow</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href={`${baseUrl}/`}
              className="text-gray-800 hover:text-green-600"
            >
              Home
            </a>
            <a
              href={`${baseUrl}/about`}
              className="text-gray-800 hover:text-green-600"
            >
              About
            </a>
            <a
              href={`${baseUrl}/contact`}
              className="text-gray-600 hover:text-green-600"
            >
              Contact
            </a>
            <a
              href={`${baseUrl}/register`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Get Started
            </a>
          </div>
        </nav>
        
        <main className="container mx-auto px-4 py-4 md:py-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 md:px-8 pt-8 pb-6 text-center bg-gradient-to-br from-green-50 to-blue-50">
                <h1 className="text-2xl md:text-3xl font-bold text-red-600 mb-2">
                  Invalid Reset Link
                </h1>
                <p className="text-gray-600">
                  The password reset link appears to be invalid or has expired.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <nav className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <DollarSign className="w-6 md:w-8 h-6 md:h-8 text-green-600" />
          <span className="ml-2 text-lg md:text-xl font-bold">CashFlow</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a
            href={`${baseUrl}/`}
            className="text-gray-800 hover:text-green-600"
          >
            Home
          </a>
          <a
            href={`${baseUrl}/about`}
            className="text-gray-800 hover:text-green-600"
          >
            About
          </a>
          <a
            href={`${baseUrl}/contact`}
            className="text-gray-600 hover:text-green-600"
          >
            Contact
          </a>
          <a
            href={`${baseUrl}/register`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Get Started
          </a>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-6 md:px-8 pt-8 pb-6 text-center bg-gradient-to-br from-green-50 to-blue-50">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Reset Password
              </h1>
              <p className="text-gray-600">Enter your new password below</p>
            </div>
            <div className="p-6 md:p-8">
              <ResetPasswordForm token={token} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}