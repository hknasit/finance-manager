/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  DollarSign,
  CheckCircle,
} from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  useEffect(() => {
    // Extract message from URL using window.location
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const message = urlParams.get("message");

      if (message) {
        // Decode the URL parameter
        const decodedMessage = decodeURIComponent(message);
        setSuccessMessage(decodedMessage);

        // Optional: Clear the message from URL after a delay
        const timeoutId = setTimeout(() => {
          const url = new URL(window.location.href);
          url.searchParams.delete("message");
          window.history.replaceState({}, "", url.toString());
        }, 5000);

        return () => clearTimeout(timeoutId);
      }
    }
  }, []);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <nav className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <DollarSign className="w-6 md:w-8 h-6 md:h-8 text-green-600" />
          <span className="ml-2 text-lg md:text-xl font-bold">CashFlow</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          {/* <a href="#features" className="text-gray-900 font-medium hover:text-green-600">Features</a> */}
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
        {/* Mobile menu button could be added here */}
      </nav>
      <main className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-md mx-auto">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Card Header */}
            <div className="px-6 md:px-8 pt-8 pb-6 text-center bg-gradient-to-br from-green-50 to-blue-50">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600">Please sign in to your account</p>
            </div>
            {/* Success Message */}
            {successMessage && (
              <div className="mx-4 md:mx-5 mt-4 flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{successMessage}</p>
              </div>
            )}
            {/* Error Message */}
            {error && (
              <div className="mx-6 md:mx-8 mt-6 flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="block w-full pl-10 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={!showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="block w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Forgot your password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    New to the platform?
                  </span>
                </div>
              </div>

              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create an account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
