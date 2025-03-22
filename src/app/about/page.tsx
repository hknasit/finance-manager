/* eslint-disable react/no-unescaped-entities */
import React from "react";
import {
  Github,
  Linkedin,
  ArrowRight,
  DollarSign,
  Briefcase,
  CircleDot,
  Sparkles,
  Layers,
  Users,
  Code
} from "lucide-react";

const AboutPage = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH;

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Navigation */}
      <div className="bg-white md:bg-gradient-to-r md:from-green-50 md:to-blue-50">
        <nav className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="w-6 md:w-8 h-6 md:h-8 text-green-600" />
            <span className="ml-2 text-lg md:text-xl font-bold">CashFlow</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {/* <a href="#features" className="text-gray-900 font-medium hover:text-green-600">Features</a> */}
            <a href={`${baseUrl}/`} className="text-gray-800 hover:text-green-600">Home</a>
            <a href={`${baseUrl}/contact`} className="text-gray-800 hover:text-green-600">Contact</a>
            <a href={`${baseUrl}/login`} className="text-gray-600 hover:text-green-600">Login</a>
            <a href={`${baseUrl}/register`} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Get Started
            </a>
          </div>
          {/* Mobile menu button could be added here */}
        </nav>

      {/* Hero Section with Pattern Background */}
      <div className="relative bg-white md:bg-gradient-to-r md:from-green-50 md:to-blue-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] bg-[length:20px_20px]"></div>
        <div className="relative container mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center px-4 py-1 mb-6 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm text-gray-600">Personal Finance Made Simple</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              About CashFlow
            </h1>
            <p className="text-xl md:text-2xl text-gray-800 font-medium mb-8 max-w-2xl mx-auto">
              A passion project to help everyone track their finances better
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://github.com/hknasit"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all hover:scale-105"
              >
                <Github className="w-5 h-5" />
                <span>View on GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/harsh-nasit-2418561b9/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all hover:scale-105"
              >
                <Linkedin className="w-5 h-5" />
                <span>Connect on LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Section with Modern Card */}
      <div className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 md:p-12 shadow-xl">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 bg-green-600 text-white p-6 rounded-2xl hidden md:flex items-center justify-center transform rotate-6">
                <Code className="w-6 h-6" />
              </div>
              
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Meet the Creator
                </h2>
                <p className="text-xl text-gray-800 font-medium leading-relaxed">
                  Hi! I'm Harsh Nasit, a full-stack developer passionate about
                  creating tools that make life easier. Currently pursuing my
                  post-graduate diploma in Full-stack Software Development at
                  Lambton College.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Code className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Technical Background
                    </h3>
                  </div>
                  <p className="text-gray-800 leading-relaxed">
                    Experienced with modern web technologies including
                    React.js, Node.js, and Next.js. Specialized in building
                    scalable applications with clean, maintainable code.
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Briefcase className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Work Experience
                    </h3>
                  </div>
                  <p className="text-gray-800 leading-relaxed">
                    Previously worked at Educloud Infotech LLP, where I led
                    JSP to React migration and developed analytics tracking
                    for school students.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Info Section with Modern Cards */}
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              About This Project
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="group hover:scale-105 transition-all duration-300">
                <div className="bg-white p-8 rounded-2xl shadow-xl h-full">
                  <div className="p-3 bg-green-100 rounded-xl w-fit mb-6 group-hover:bg-green-200 transition-colors">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Why CashFlow?
                  </h3>
                  <p className="text-gray-800 leading-relaxed mb-4">
                    CashFlow started as a personal project to solve my own finance
                    tracking needs. It's currently free to use while in
                    development, as I believe everyone should have access to good
                    financial tools.
                  </p>
                  <p className="text-gray-800 leading-relaxed">
                    Built with modern technologies and a focus on user experience,
                    it's designed to make finance tracking simple and effective.
                  </p>
                </div>
              </div>

              <div className="group hover:scale-105 transition-all duration-300">
                <div className="bg-white p-8 rounded-2xl shadow-xl h-full">
                  <div className="p-3 bg-green-100 rounded-xl w-fit mb-6 group-hover:bg-green-200 transition-colors">
                    <Layers className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Tech Stack
                  </h3>
                  <ul className="space-y-4 text-gray-800">
                    {[
                      { text: "Frontend: Next.js, React, Tailwind CSS" },
                      { text: "Backend: Node.js" },
                      { text: "Database: MongoDB with Mongoose" },
                      { text: "Authentication: JWT" }
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CircleDot className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced CTA Section */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Tracking?
          </h2>
          <p className="text-white text-lg mb-10 max-w-2xl mx-auto opacity-90">
            Join me in making finance management easier. It's completely free
            during the development phase!
          </p>
          <a
            href={`${baseUrl}/register`}
            className="inline-flex items-center px-8 py-4 bg-white text-green-600 rounded-xl hover:bg-green-50 transition-all hover:scale-105 text-lg font-medium shadow-lg"
          >
            Get Started Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </div>
      </div>

   {/* Footer */}
         <footer className="bg-gray-50 py-8 md:py-12">
           <div className="container mx-auto px-4 md:px-6">
             <div className="flex flex-col md:flex-row justify-between items-center">
               <div className="flex items-center mb-4 md:mb-0">
                 <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                 <span className="ml-2 text-base md:text-lg font-semibold">
                   CashFlow
                 </span>
               </div>
               <div className="flex flex-wrap justify-center gap-4 md:space-x-6">
                 <a
                   href={`${baseUrl}/`}
                   className="text-sm md:text-base text-gray-600 hover:text-green-600"
                 >
                   Home
                 </a>
                 <a
                   href={`${baseUrl}/contact`}
                   className="text-sm md:text-base text-gray-600 hover:text-green-600"
                 >
                   Contact
                 </a>
                 <a
                    href={`${baseUrl}/login`}
                   className="text-sm md:text-base text-gray-600 hover:text-green-600"
                 >
                   Login
                 </a>
                 <a
                    href={`${baseUrl}/register`}
                   className="text-sm md:text-base text-gray-600 hover:text-green-600"
                 >
                   Register
                 </a>
               </div>
             </div>
             <div className="mt-6 md:mt-8 text-center text-gray-500 text-xs md:text-sm">
               © {new Date().getFullYear()} CashFlow. All rights reserved.
             </div>
           </div>
         </footer>
    </div>
  );
};

export default AboutPage;