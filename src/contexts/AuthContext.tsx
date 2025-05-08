"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface User {
  username: string;
  id: string;
  email: string;
  isVerified: boolean;
  exp: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  useEffect(() => {
    checkAuth();
  
  },[]);

  function checkAuth() {
    try {
      const token = getCookie("auth-token");

      if (!token) {
        handleLogout();
        return;
      }

      // Use jwtDecode instead of verify on client side
      const decoded = jwtDecode<User>(token);

      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        handleLogout();
        return;
      }

      setUser(decoded);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth check failed:", error);
      handleLogout();
    }
  }


  function getCookie(name: string): string | null {
    return (
      document.cookie
        .split("; ")
        .find((row) => row.startsWith(name + "="))
        ?.split("=")[1] || null
    );
  }

  async function login(email: string, password: string) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Important for cookie handling
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();

      // The token should be set as a cookie by the server
      // We just need to decode it here to get the user info
      const decoded = jwtDecode<User>(data.token);
      setUser(decoded);
      setIsAuthenticated(true);
      router.push(`${process.env.NEXT_PUBLIC_BASE_PATH}/dashboard`);
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error);
    }
  }

  function handleLogout() {
    // Clear the cookie with the same path and domain as it was set
    document.cookie =
      "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    setIsAuthenticated(false);
  }

  async function logout() {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      handleLogout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      handleLogout();
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
