import React from 'react';
import { ArrowRight, DollarSign, PieChart, CalendarDays, FileClock, CreditCard, Wallet, FileSpreadsheet, Receipt } from 'lucide-react';

const LandingPage = () => {

    const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH;
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-green-50 to-blue-50">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="ml-2 text-xl font-bold">CashFlow</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-green-600">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-green-600">How it Works</a>
            <a href={`${baseUrl}/login`} className="text-gray-600 hover:text-green-600">Login</a>
            <a href={`${baseUrl}/register`} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Get Started
            </a>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Track Every Dollar, Make Better Decisions
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Comprehensive financial tracking for both personal and part-time income. 
                Monitor expenses, analyze spending patterns, and export detailed reports.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href={`${baseUrl}/register`} className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Start Tracking
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
                <a href="#features" className="inline-flex items-center justify-center px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                  See Features
                </a>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12">
              <div className="bg-white p-6 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-gray-500">January 2025</p>
                    <div className="flex items-baseline gap-4">
                      <p className="text-red-500 text-2xl font-bold">-$768.51</p>
                      <p className="text-xs text-gray-500">Net Balance</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Income</p>
                      <p className="text-green-600">$391.16</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Expense</p>
                      <p className="text-red-500">$1,159.67</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <CreditCard className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">Rent Payment</p>
                        <p className="text-xs text-gray-500">Card Payment</p>
                      </div>
                    </div>
                    <p className="font-medium text-red-500">-$1,100.00</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">TPS GST</p>
                        <p className="text-xs text-gray-500">Canada CRA Income</p>
                      </div>
                    </div>
                    <p className="font-medium text-green-600">+$391.16</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need for complete financial tracking
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Receipt className="w-6 h-6 text-green-600" />,
                title: "Income & Expense Tracking",
                description: "Track both card and cash transactions with detailed categorization"
              },
              {
                icon: <PieChart className="w-6 h-6 text-green-600" />,
                title: "Visual Analytics",
                description: "Understand your spending patterns with intuitive pie charts and analysis"
              },
              {
                icon: <CalendarDays className="w-6 h-6 text-green-600" />,
                title: "Monthly Overview",
                description: "View and manage transactions with detailed monthly breakdowns"
              },
              {
                icon: <FileClock className="w-6 h-6 text-green-600" />,
                title: "Part-time Income",
                description: "Track salary, tips, and tax deductions for part-time work"
              },
              {
                icon: <FileSpreadsheet className="w-6 h-6 text-green-600" />,
                title: "Excel Reports",
                description: "Generate and export detailed financial reports to Excel"
              },
              {
                icon: <Wallet className="w-6 h-6 text-green-600" />,
                title: "Multi-Currency",
                description: "Support for both USD and INR currencies"
              }
            ].map((feature, index) => (
              <div key={index} className="p-6 border rounded-xl hover:shadow-lg transition-shadow">
                <div className="p-3 bg-green-50 rounded-lg w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Simple and Effective Money Management
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Add Transactions</h3>
              <p className="text-gray-600">Record your daily income and expenses with detailed categories</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">Monitor your financial health with real-time analytics</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Generate Reports</h3>
              <p className="text-gray-600">Export detailed Excel reports for better financial planning</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Managing Your Money Better Today
          </h2>
          <p className="text-green-50 mb-8 max-w-2xl mx-auto">
            Join other users who are tracking their finances effectively with CashFlow.
          </p>
          <a href={`${baseUrl}/register`} className="inline-flex items-center px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors">
            Create Free Account
            <ArrowRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <DollarSign className="w-6 h-6 text-green-600" />
              <span className="ml-2 text-lg font-semibold">CashFlow</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-green-600">About</a>
              <a href="#" className="text-gray-600 hover:text-green-600">Privacy</a>
              <a href="#" className="text-gray-600 hover:text-green-600">Terms</a>
              <a href="#" className="text-gray-600 hover:text-green-600">Contact</a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} CashFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;