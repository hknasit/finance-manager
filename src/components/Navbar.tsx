"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  LogIn,
  ChevronDown,
  Calendar1,
  CalendarDays,
  ArrowLeftRight,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const protectedNavigation = [
    {
      name: "Add",
      href: "/dashboard",
      icon: ArrowLeftRight,
      description: "Add new transactions",
    },
    {
      name: "Year",
      href: "/spreadsheet",
      icon: Calendar1,
      description: "Yearly records",
    },
    {
      name: "Month",
      href: "/month",
      icon: CalendarDays,
      description: "Monthly records",
    },
  ];

  const isActive = (path: string) => pathname === path;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand - Simplified for mobile */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">$</span>
              </div>
              <span className="text-lg md:text-xl font-semibold text-gray-900">
                My 
                <span className="hidden sm:inline"> Money</span>
              </span>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {/* Desktop Navigation */}
                  <div className="hidden md:flex items-center space-x-4">
                    {protectedNavigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors
                            ${
                              isActive(item.href)
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      );
                    })}

                    {/* User Profile - Desktop */}
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-700 font-medium">
                            {user?.username?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-700">
                            {user?.username || "User"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={logout}
                        className="p-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                        title="Sign out"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="md:hidden" ref={dropdownRef}>
                    <button
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      className="p-2 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                      aria-expanded={isMobileMenuOpen}
                    >
                      {isMobileMenuOpen ? (
                        <User className="h-6 w-6" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-700 font-medium">
                              {user?.username?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          </div>
                          <ChevronDown className="h-4 w-4 text-slate-500" />
                        </div>
                      )}
                    </button>

                    {/* Mobile Menu - Full Screen */}
                    {isMobileMenuOpen && (
                      <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-lg">
                        {/* Mobile User Profile */}
                        <div className="px-4 py-3 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-700 font-medium text-lg">
                                {user?.username?.charAt(0)?.toUpperCase() ||
                                  "U"}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">
                                {user?.username || "User"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="py-2 px-4 space-y-1">
                          {protectedNavigation.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base ${
                                  isActive(item.href)
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-sm text-slate-500">
                                    {item.description}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                          <div
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-base text-slate-700 hover:bg-slate-50 rounded-lg"
                          >
                            <LogOut className="h-5 w-5" />
                            <div>
                              <div className="font-medium">Sign out</div>
                              <div className="text-sm text-slate-500">
                                Log out of your account
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Login Button for Non-authenticated Users
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign in</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
