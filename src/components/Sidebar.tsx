"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  Menu,
  X,
  Home,
  Calendar,
  Tag,
  ChartLine,
  FileChartColumn,
  DollarSign,
  PlusCircle,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Sidebar() {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    {
      name: "Home",
      href: "/dashboard",
      icon: Home,
      description: "Home page",
    },
    {
      name: "Year",
      href: "/year",
      icon: Calendar,
      description: "Yearly records",
    },
    {
      name: "Categories",
      href: "/category",
      icon: Tag,
      description: "Add, edit categories",
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: ChartLine,
      description: "View analytics",
    },
    {
      name: "Report",
      href: "/report",
      icon: FileChartColumn,
      description: "View report",
    },
  ];

  const isActive = (path: string) => pathname === path;

  // Close menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Define paths where the Sidebar should not be displayed
  const noSidebarPaths = ["/", "/about/", "/contact/"];
  if (noSidebarPaths.includes(pathname)) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="sidebar custom-scrollbar transition-sidebar">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg">CashFlow</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-20 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Logo */}
          <div className="h-16 flex items-center gap-2 px-4 border-b">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">CashFlow</span>
          </div>

          {/* Quick Action Button */}
          <div className="p-4">
            <button className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors">
              <PlusCircle className="w-5 h-5" />
              Add Transaction
            </button>
          </div>

          {/* Navigation */}
          <nav className="px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg mb-1 transition-colors ${
                    isActive(item.href)
                      ? "bg-green-50 text-green-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  {isActive(item.href) && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="absolute bottom-0 left-0 right-0 border-t bg-white p-4">
            {/* User Info */}
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors mb-2"
            >
              <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-700 font-medium">
                  {user?.username?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.username || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">View Profile</p>
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Main Content Wrapper */}
        {/* <div className="lg:pl-64"> */}
          <div className="min-h-screen pt-[57px] lg:pt-0">
            {/* Content Container */}
            <div className="max-w-6xl mx-auto p-4">
              {/* Your page content goes here */}
            </div>
          </div>
        {/* </div> */}

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
    </>
  );
}
