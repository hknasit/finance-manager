"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Category {
  _id: string;
  name: string;
  type: "income" | "expense";
}

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (name: string, type: "income" | "expense") => Promise<void>;
  updateCategory: (
    id: string,
    name: string,
    type: "income" | "expense"
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/user/categories`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name: string, type: "income" | "expense") => {
    try {
      setError(null);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/user/categories`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, type }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add category");
      }

      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCategory = async (
    id: string,
    name: string,
    type: "income" | "expense"
  ) => {
    try {
      setError(null);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/user/categories/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, type }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update category");
      }

      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/user/categories/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete category");
      }

      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        error,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
};
