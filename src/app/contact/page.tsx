"use client";
/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import {
  DollarSign,
  Mail,
  MessageSquare,
  Send,
  MapPin,
  Clock,
  Loader2,
} from "lucide-react";

const ContactPage = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const response = await fetch(`${baseUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Clear form on success
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setStatus({
        type: "success",
        message: "Message sent successfully! We'll get back to you soon.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Navigation */}
      <header className="bg-white md:bg-gradient-to-r md:from-green-50 md:to-blue-50">
        <nav className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="w-6 md:w-8 h-6 md:h-8 text-green-600" />
            <span className="ml-2 text-lg md:text-xl font-bold">CashFlow</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href={`${baseUrl}/`}
              className="text-gray-600 hover:text-green-600"
            >
              Home
            </a>
            <a
              href={`${baseUrl}/about`}
              className="text-gray-600 hover:text-green-600"
            >
              About
            </a>
            <a
              href={`${baseUrl}/login`}
              className="text-gray-600 hover:text-green-600"
            >
              Login
            </a>
            <a
              href={`${baseUrl}/register`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Get Started
            </a>
          </div>
        </nav>

        {/* Contact Header */}
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-lg md:text-xl text-gray-800 font-medium">
              Have questions or suggestions? We'd love to hear from you.
            </p>
          </div>
        </div>
      </header>

      {/* Contact Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Send us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {status.type && (
                    <div
                      className={`p-4 rounded-lg ${
                        status.type === "success"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {status.message}
                    </div>
                  )}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-colors"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-colors"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-colors"
                      placeholder="How can we help?"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-colors"
                      placeholder="Your message here..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Contact Information
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <Mail className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Email
                        </h3>
                        <a
                          href="mailto:harshnasit1100@gmail.com"
                          className="text-green-600 hover:text-green-700"
                        >
                          harshkishornasit@gmail.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <MapPin className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Location
                        </h3>
                        <p className="text-gray-600">Toronto, ON, Canada</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Response Section */}
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Quick Response
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    We aim to respond to all inquiries within 24 hours during
                    business days. For urgent matters, please email us directly.
                  </p>
                </div>

                {/* Contact Benefits */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Why Contact Us?
                    </h3>
                  </div>
                  <ul className="space-y-3 text-gray-600">
                    <li>• Get help with account setup</li>
                    <li>• Report issues or bugs</li>
                    <li>• Submit feature requests</li>
                    <li>• Share your feedback</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                href={`${baseUrl}/about`}
                className="text-sm md:text-base text-gray-600 hover:text-green-600"
              >
                About
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

export default ContactPage;
