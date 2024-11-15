/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { CreditCard, ShoppingCart, X, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CalculatorState {
  currentValue: string;
  previousValue: string;
  operation: string | null;
  isNewNumber: boolean;
}

export default function TransactionInput() {
  const { isAuthenticated } = useAuth();
  const [description, setDescription] = useState("");
  const [type, setType] = useState("expense");
  const [account, setAccount] = useState("card");
  const [category, setCategory] = useState("Rent");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Calculator state
  const [calc, setCalc] = useState<CalculatorState>({
    currentValue: "0",
    previousValue: "",
    operation: null,
    isNewNumber: true,
  });

  // Handle number input
  const handleNumber = (num: string) => {
    if (calc.isNewNumber) {
      setCalc((prev) => ({
        ...prev,
        currentValue: num,
        isNewNumber: false,
      }));
    } else {
      if (num === "." && calc.currentValue.includes(".")) return;
      setCalc((prev) => ({
        ...prev,
        currentValue: prev.currentValue + num,
      }));
    }
  };

  // Handle operation
  const handleOperation = (op: string) => {
    if (calc.operation && !calc.isNewNumber) {
      // Calculate previous operation first
      calculateResult();
    }

    setCalc((prev) => ({
      ...prev,
      operation: op,
      previousValue: prev.currentValue,
      isNewNumber: true,
    }));
  };

  // Calculate result
  const calculateResult = () => {
    if (!calc.operation || !calc.previousValue) return;

    const prev = parseFloat(calc.previousValue);
    const current = parseFloat(calc.currentValue);
    let result = 0;

    switch (calc.operation) {
      case "+":
        result = prev + current;
        break;
      case "-":
        result = prev - current;
        break;
      case "×":
        result = prev * current;
        break;
      case "÷":
        result = prev / current;
        break;
    }

    setCalc({
      currentValue: result.toString(),
      previousValue: "",
      operation: null,
      isNewNumber: true,
    });
  };

  // Handle equals
  const handleEquals = () => {
    if (calc.operation) {
      calculateResult();
    }
  };

  // Clear calculator
  const handleClear = () => {
    setCalc({
      currentValue: "0",
      previousValue: "",
      operation: null,
      isNewNumber: true,
    });
  };

  // Save transaction
  const handleSave = async () => {
    try {
      if (!isAuthenticated) {
        throw new Error("Please login to add transactions");
      }

      if (!description.trim()) {
        throw new Error("Please add a description");
      }

      setLoading(true);
      setError("");

      const amount = parseFloat(calc.currentValue);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      const transactionData = {
        type,
        category,
        amount,
        description: description.trim(),
        paymentMethod: account,
        date: new Date().toISOString(),
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/transactions/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save transaction");
      }

      handleClear();
      setDescription("");
      // Show success message or redirect
      console.log("Google sheet update")

    } catch (err) {
      setError(err.message);
      console.error("Transaction error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white p-4 rounded-3xl shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => window.history.back()}
          disabled={loading}
          className="text-green-600 font-medium flex items-center gap-1"
        >
          <X size={18} />
          CANCEL
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="text-green-600 font-medium flex items-center gap-1"
        >
          <Check size={18} />
          {loading ? "SAVING..." : "SAVE"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-600 rounded text-sm">
          {error}
        </div>
      )}

      {/* Transaction Type Selector */}
      <div className="flex justify-center gap-4 text-sm mb-6">
        {["income", "expense", "transfer"].map((t) => (
          <button
            key={t}
            className={`uppercase ${
              type === t ? "text-green-600" : "text-gray-400"
            }`}
            onClick={() => setType(t)}
            disabled={loading}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Account and Category */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-gray-500 text-sm mb-1">Account</div>
          <button
            className="w-full flex items-center gap-2 p-2 border rounded-lg"
            disabled={loading}
          >
            <CreditCard className="w-5 h-5 text-gray-600" />
            <span>Card</span>
          </button>
        </div>
        <div>
          <div className="text-gray-500 text-sm mb-1">Category</div>
          <button
            className="w-full flex items-center gap-2 p-2 border rounded-lg"
            disabled={loading}
          >
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            <span>{category}</span>
          </button>
        </div>
      </div>

      {/* Description Input */}
      <div className="mb-4 p-3 border rounded-lg">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full outline-none"
          disabled={loading}
        />
      </div>

      {/* Amount Display */}
      <div className="text-right mb-4 p-3 border rounded-lg">
        <div className="text-4xl font-semibold">{calc.currentValue}</div>
        {calc.operation && (
          <div className="text-sm text-gray-500">
            {calc.previousValue} {calc.operation}
          </div>
        )}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-2">
        {/* Operations */}
        <button
          onClick={() => handleOperation("+")}
          className="p-4 bg-green-600 text-white rounded-lg"
        >
          +
        </button>
        <button
          onClick={() => handleNumber("7")}
          className="p-4 bg-gray-50 rounded-lg"
        >
          7
        </button>
        <button
          onClick={() => handleNumber("8")}
          className="p-4 bg-gray-50 rounded-lg"
        >
          8
        </button>
        <button
          onClick={() => handleNumber("9")}
          className="p-4 bg-gray-50 rounded-lg"
        >
          9
        </button>

        <button
          onClick={() => handleOperation("-")}
          className="p-4 bg-green-600 text-white rounded-lg"
        >
          -
        </button>
        <button
          onClick={() => handleNumber("4")}
          className="p-4 bg-gray-50 rounded-lg"
        >
          4
        </button>
        <button
          onClick={() => handleNumber("5")}
          className="p-4 bg-gray-50 rounded-lg"
        >
          5
        </button>
        <button
          onClick={() => handleNumber("6")}
          className="p-4 bg-gray-50 rounded-lg"
        >
          6
        </button>

        <button
          onClick={() => handleOperation("×")}
          className="p-4 bg-green-600 text-white rounded-lg"
        >
          ×
        </button>
        <button
          onClick={() => handleNumber("1")}
          className="p-4 bg-gray-50 rounded-lg"
        >
          1
        </button>
        <button
          onClick={() => handleNumber("2")}
          className="p-4 bg-gray-50 rounded-lg"
        >
          2
        </button>
        <button
          onClick={() => handleNumber("3")}
          className="p-4 bg-gray-50 rounded-lg"
        >
          3
        </button>

        <button
          onClick={() => handleOperation("÷")}
          className="p-4 bg-green-600 text-white rounded-lg"
        >
          ÷
        </button>
        <button
          onClick={() => handleNumber("0")}
          className="p-4 bg-gray-50 rounded-lg"
        >
          0
        </button>
        <button
          onClick={() => handleNumber(".")}
          className="p-4 bg-gray-50 rounded-lg"
        >
          .
        </button>
        <button
          onClick={handleEquals}
          className="p-4 bg-green-600 text-white rounded-lg"
        >
          =
        </button>
      </div>

      {/* Date Display */}
      <div className="mt-4 text-center text-gray-500 text-sm">
        {new Date().toLocaleDateString()}{" "}
        {new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}
