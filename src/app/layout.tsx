import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
// import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import { CategoryProvider } from "@/contexts/CategoryContext";
import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import MainWrapper from "@/components/layout/MainWrapper";
import Sidebar from "@/components/Sidebar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "CashFlow",
  description:
    "CashFlow is a personal finance management web application that helps users manage their finances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CategoryProvider>
            <UserPreferencesProvider>
              <TransactionProvider>
                <div className="flex flex-col lg:flex-row min-h-screen">
                  {/* <Navbar /> */}
                  <Sidebar />
                  <MainWrapper>{children}</MainWrapper>
                </div>
              </TransactionProvider>
            </UserPreferencesProvider>
          </CategoryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
