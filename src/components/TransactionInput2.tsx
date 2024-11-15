import React, { useState, useEffect, useRef } from "react";
import { CreditCard, Wallet, X, Check, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DatePicker from "./DatePicker";

const categories = {
  income: ["Salary", "Part-time", "Other Income"],
  expense: ["Credit Bill", "Donation", "Rent", "Food", "Miscellaneous"],
};

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
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [category, setCategory] = useState("Food");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [transactionDate, setTransactionDate] = useState(new Date());
  const categoryRef = useRef<HTMLDivElement>(null);

  const [calc, setCalc] = useState<CalculatorState>({
    currentValue: "0",
    previousValue: "",
    operation: null,
    isNewNumber: true,
  });

  // Close category dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setShowCategories(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleOperation = (op: string) => {
    if (calc.operation && !calc.isNewNumber) {
      calculateResult();
    }
    setCalc((prev) => ({
      ...prev,
      operation: op,
      previousValue: prev.currentValue,
      isNewNumber: true,
    }));
  };

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

  const handleEquals = () => {
    if (calc.operation) calculateResult();
  };

  const handleClear = () => {
    setCalc({
      currentValue: "0",
      previousValue: "",
      operation: null,
      isNewNumber: true,
    });
  };

  const handleTypeChange = (newType: "income" | "expense") => {
    setType(newType);
    setCategory(categories[newType][0]);
  };

  const handleSave = async () => {
    try {
      if (!isAuthenticated) throw new Error("Please login to add transactions");
      if (!description.trim()) throw new Error("Please add a description");

      setLoading(true);
      setError("");

      const amount = parseFloat(calc.currentValue);
      if (isNaN(amount) || amount <= 0)
        throw new Error("Please enter a valid amount");

      const transactionData = {
        type,
        category,
        amount,
        description: description.trim(),
        paymentMethod,
        date: transactionDate.toISOString(),
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
    } catch (err) {
      setError(err.message);
      console.error("Transaction error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 md:bg-white md:min-h-[calc(100vh-4rem)] w-full flex items-start justify-center">
      <div className="w-full md:max-w-sm bg-white md:my-4 md:rounded-3xl md:shadow-lg">
        {/* Fixed Header */}
        <div className="sticky top-0 z-10 bg-white px-4 py-3 flex justify-between items-center border-b border-slate-200 md:border-none">
          <button
            onClick={() => window.history.back()}
            disabled={loading}
            className="text-green-600 font-medium flex items-center gap-1 p-2 hover:bg-green-50 rounded-lg"
          >
            <X size={20} />
            <span className="text-sm">CANCEL</span>
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="text-green-600 font-medium flex items-center gap-1 p-2 hover:bg-green-50 rounded-lg"
          >
            <Check size={20} />
            <span className="text-sm">{loading ? "SAVING..." : "SAVE"}</span>
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Transaction Type Selector */}
          <div className="flex justify-center gap-6 text-sm font-medium mb-6">
            {["income", "expense"].map((t) => (
              <button
                key={t}
                className={`uppercase p-2 ${
                  type === t
                    ? "text-green-600 font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => handleTypeChange(t as "income" | "expense")}
                disabled={loading}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Payment Method and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="">
              <div className="text-slate-700 font-medium text-sm mb-2">
                Payment Method
              </div>
              <div className="flex gap-2">
                <button
                  className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl transition-colors ${
                    paymentMethod === "card"
                      ? "bg-green-100 border-green-600 text-green-700 font-medium"
                      : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  onClick={() => setPaymentMethod("card")}
                  disabled={loading}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Card</span>
                </button>
                <button
                  className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl transition-colors ${
                    paymentMethod === "cash"
                      ? "bg-green-100 border-green-600 text-green-700 font-medium"
                      : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  onClick={() => setPaymentMethod("cash")}
                  disabled={loading}
                >
                  <Wallet className="w-5 h-5" />
                  <span>Cash</span>
                </button>
              </div>
            </div>

            <div className="relative xl:mx-2" ref={categoryRef}>
              <div className="text-slate-700 font-medium text-sm mb-2">
                Category
              </div>
              <button
                className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors text-slate-700"
                onClick={() => setShowCategories(!showCategories)}
                disabled={loading}
              >
                <span>{category}</span>
                <ChevronDown className="w-5 h-5" />
              </button>

              {showCategories && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                  {categories[type].map((cat) => (
                    <button
                      key={cat}
                      className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        setCategory(cat);
                        setShowCategories(false);
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description Input */}
          <div className="mb-4">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-green-600 transition-colors text-slate-900 placeholder:text-slate-500"
              disabled={loading}
            />
          </div>

          <DatePicker
            selectedDate={transactionDate}
            onChange={(newDate) => setTransactionDate(newDate)}
          />

          {/* Amount Display - Higher contrast background */}
          <div className="text-right mb-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
            <div className="text-4xl font-semibold tracking-tight text-slate-900">
              {calc.currentValue}
            </div>
            {calc.operation && (
              <div className="text-sm text-slate-600 mt-1 font-medium">
                {calc.previousValue} {calc.operation}
              </div>
            )}
          </div>

          {/* Keypad - Higher contrast keys */}
          <div className="grid grid-cols-4 gap-3">
            {[
              "+",
              "7",
              "8",
              "9",
              "-",
              "4",
              "5",
              "6",
              "×",
              "1",
              "2",
              "3",
              "÷",
              "0",
              ".",
              "=",
            ].map((key) => (
              <button
                key={key}
                onClick={() => {
                  if (["+", "-", "×", "÷"].includes(key)) handleOperation(key);
                  else if (key === "=") handleEquals();
                  else handleNumber(key);
                }}
                className={`p-4 md:p-5 text-lg rounded-xl transition-colors font-medium ${
                  ["+", "-", "×", "÷", "="].includes(key)
                    ? "bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
                    : "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
