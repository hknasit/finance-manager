"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface Category {
  _id: string;
  name: string;
  type: "income" | "expense";
}

interface CategoryContextType {
  categories: {
    income: Category[];
    expense: Category[];
  };
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
  const [categories, setCategories] = useState<{
    income: Category[];
    expense: Category[];
  }>({
    income: [],
    expense: [],
  });
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortAndGroupCategories = (categoriesArray: Category[]) => {
    const sorted = categoriesArray.reduce<{
      income: Category[];
      expense: Category[];
    }>(
      (acc, category) => {
        acc[category.type].push(category);
        return acc;
      },
      { income: [], expense: [] }
    );

    sorted.income.sort((a, b) => a.name.localeCompare(b.name));
    sorted.expense.sort((a, b) => a.name.localeCompare(b.name));

    return sorted;
  };

  const fetchCategories = async () => {
    try {
      if (!isAuthenticated) return;
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/user/categories`
      );
      if (!response.ok) throw new Error("Failed to fetch categories");

      const data = await response.json();
      setCategories(sortAndGroupCategories(data.categories));
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
      setCategories(sortAndGroupCategories(data.categories));
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
      setCategories(sortAndGroupCategories(data.categories));
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
      setCategories(sortAndGroupCategories(data.categories));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    }
  }, []);
  useEffect(() => {
    fetchCategories();
  }, [isAuthenticated]);
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
