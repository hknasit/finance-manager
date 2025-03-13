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
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Year", href: "/year", icon: Calendar },
    { name: "Categories", href: "/category", icon: Tag },
    { name: "Analytics", href: "/analytics", icon: ChartLine },
    { name: "Report", href: "/report", icon: FileChartColumn },
  ];

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    // Close menu on route change
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Prevent body scroll when menu is open
    if (isMobileMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isMobileMenuOpen]);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b px-4 py-3">
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
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-md transform transition-transform duration-200 ease-in-out lg:translate-x-0 
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center gap-2 px-4 border-b">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg">CashFlow</span>
        </div>

        {/* Quick Action */}
        <div className="p-4">
          <button className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors">
            <PlusCircle className="w-5 h-5" />
            Add Transaction
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-2 py-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg mb-1 transition-colors ${
                isActive(item.href)
                  ? "bg-green-50 text-green-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
              {isActive(item.href) && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t bg-white p-4">
          <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors mb-2">
            <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-700 font-medium">
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.username || "User"}</p>
              <p className="text-xs text-gray-500 truncate">View Profile</p>
            </div>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
