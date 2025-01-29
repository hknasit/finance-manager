/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  Wallet,
  X,
  Check,
  ChevronDown,
  Search,
  ImageIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import "react-datepicker/dist/react-datepicker.css";
import { useCategories } from "@/contexts/CategoryContext";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { cloudinaryConfig } from "@/lib/config/cloudinary";
import { CldUploadWidget } from "next-cloudinary";
import type {
  CloudinaryUploadResult,
  CloudinaryAsset,
} from "@/types/cloudinary";
import { formatCloudinaryResult } from "@/lib/utils/cloudinary";

dayjs.extend(utc);
dayjs.extend(timezone);



interface Transaction {
  _id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod: "card" | "cash";
  notes?: string;
}
interface TransactionInputProps {
  setShowForm: (boolean) => void;
  setTransactions: (transactions: Transaction[]) => void;
}
const datePickerTheme = createTheme({
  palette: {
    primary: {
      main: "#16a34a", // green-600
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "0.75rem", // rounded-xl
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#e2e8f0", // slate-200
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#cbd5e1", // slate-300
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#16a34a", // green-600
            borderWidth: "1px",
          },
          fontSize: "0.875rem", // text-sm
          "& input": {
            padding: "0.625rem 0.75rem", // py-2.5 px-3
          },
        },
      },
    },
    //@ts-ignore
    MuiPickersDay: {
      styleOverrides: {
        root: {
          fontFamily: "inherit",
          borderRadius: "0.375rem",
          "&.Mui-selected": {
            backgroundColor: "#16a34a", // green-600
            "&:hover": {
              backgroundColor: "#15803d", // green-700
            },
          },
          "&:hover": {
            backgroundColor: "#f1f5f9", // slate-100
          },
        },
      },
    },
    MuiPickersCalendarHeader: {
      styleOverrides: {
        root: {
          fontFamily: "inherit",
          "& .MuiPickersCalendarHeader-label": {
            fontSize: "0.875rem",
            fontWeight: 500,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "0.75rem",
        },
      },
    },
  },
});

export default function TransactionInput({
  setShowForm,
  setTransactions,
}: TransactionInputProps) {
  const { isAuthenticated } = useAuth();
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [error, setError] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [transactionDate, setTransactionDate] = useState(dayjs().toDate()); // new Date());
  const categoryRef = useRef<HTMLDivElement>(null);
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { preferences, setPreferences } = useUserPreferences();
  const [imageData, setImageData] = useState<CloudinaryAsset | null>(null);

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

  // Update category whenever categories or type changes
  useEffect(() => {
    const categoryList =
      type === "expense" ? categories.expense : categories.income;
    if (categoryList.length > 0 && !category) {
      setCategory(categoryList[0].name);
    }
  }, [categories, type, category]);

  const handleUploadSuccess = (result: CloudinaryUploadResult) => {
    const formattedAsset = formatCloudinaryResult(result);
    setImageData(formattedAsset);
  };
  // Add this function to handle upload error
  const handleUploadError = (error: any) => {
    console.error("Upload error:", error);
    setError("Failed to upload image. Please try again.");
  };

  const handleTypeChange = (newType: "income" | "expense") => {
    setType(newType);
    const categoryList =
      newType === "expense" ? categories.expense : categories.income;
    if (categoryList.length > 0) {
      setCategory(categoryList[0].name);
    } else {
      setCategory("");
    }
    setSearchTerm("");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setAmount(value);
    }
  };

  const handleClear = () => {
    setShowForm(false);
    setAmount("");
  };

  const handleSave = async () => {
    try {
      if (!isAuthenticated) throw new Error("Please login to add transactions");
      if (!description.trim()) throw new Error("Please add a description");
      if (!amount || parseFloat(amount) <= 0)
        throw new Error("Please enter a valid amount");

      setLoading(true);
      setError("");
      const localDate = new Date(transactionDate);
      localDate.setHours(0, 0, 0, 0);

      // Format date in YYYY-MM-DD format to avoid timezone issues
      const formattedDate = localDate.toISOString().split("T")[0];
      const transactionData = {
        type,
        category,
        amount: parseFloat(amount),
        description: description.trim(),
        paymentMethod,
        date: formattedDate,
        image: imageData, // Add this line
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/transactions/add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...transactionData,
            currentBankBalance: preferences.bankBalance,
            currentCashBalance: preferences.cashBalance,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save transaction");
      }

      // update new balance in context
      const data = await response.json();

      setPreferences((prev) => ({
        ...prev,
        bankBalance: data.balances.bankBalance,
        cashBalance: data.balances.cashBalance,
      }));

      // const newTransaction = await response.json();
      //@ts-ignore
      setTransactions((prevTransactions: Transaction[]) => [
        ...prevTransactions,
        data.transaction,
      ]);
      setAmount("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      setError(err.message);
      console.error("Transaction error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = (
    type === "expense" ? categories.expense : categories.income
  ).filter((cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-start justify-center px-4 z-40">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col max-h-[85vh] mt-4 mb-20">
        {/* Header */}
        <div className="sticky top-0 p-3 flex justify-between items-center border-b border-slate-200 bg-white rounded-t-2xl z-10">
          <button
            onClick={handleClear}
            disabled={loading}
            className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
            <span className="text-sm">Close</span>
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1.5 px-3 py-1.5 hover:bg-green-50 rounded-lg transition-colors"
          >
            <Check size={18} />
            <span className="text-sm">{loading ? "Saving..." : "Save"}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3.5">
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* Transaction Type */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              {["income", "expense"].map((t) => (
                <button
                  key={t}
                  className={`py-2.5 px-3 rounded-lg transition-all text-sm font-medium ${
                    type === t
                      ? "bg-white shadow-sm text-green-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                  onClick={() => handleTypeChange(t as "income" | "expense")}
                  disabled={loading}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Payment Method
              </label>
              <div className="flex gap-2">
                {[
                  { id: "card", icon: CreditCard, label: "Card" },
                  { id: "cash", icon: Wallet, label: "Cash" },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 border rounded-xl transition-colors ${
                      paymentMethod === id
                        ? "bg-green-50 border-green-600 text-green-700 font-medium"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                    onClick={() => setPaymentMethod(id)}
                    disabled={loading}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add the image upload section */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Receipt Image
              </label>
              {!imageData ? (
                <CldUploadWidget
                  uploadPreset={cloudinaryConfig.uploadPreset}
                  onSuccess={(result: any) => handleUploadSuccess(result.info)}
                  onError={handleUploadError}
                  // @ts-ignore
                  options={cloudinaryConfig.uploadOptions}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                      <span className="text-sm text-slate-600">
                        Upload receipt image
                      </span>
                    </button>
                  )}
                </CldUploadWidget>
              ) : (
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={imageData.url}
                    alt="Receipt"
                    className="w-full h-32 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageData(null)}
                    disabled={loading}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              )}
            </div>
            {/* Category */}
            <div className="relative" ref={categoryRef}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Category
              </label>
              <button
                className="w-full flex items-center justify-between py-2.5 px-3 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors text-slate-700"
                onClick={() => setShowCategories(!showCategories)}
                disabled={loading}
              >
                <span className="text-sm">{category}</span>
                <ChevronDown size={18} />
              </button>

              {showCategories && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-slate-200">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search categories..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCategories.map((cat) => (
                      <button
                        key={cat._id}
                        className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors text-sm ${
                          category === cat.name
                            ? "text-green-600 font-medium bg-green-50"
                            : "text-slate-600"
                        }`}
                        onClick={() => {
                          setCategory(cat.name);
                          setShowCategories(false);
                          setSearchTerm("");
                        }}
                      >
                        {cat.name}
                      </button>
                    ))}
                    {filteredCategories.length === 0 && (
                      <div className="px-3 py-2.5 text-slate-500 text-sm">
                        No categories found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this for?"
                className="w-full py-2.5 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-green-600 transition-colors text-slate-900 placeholder:text-slate-400"
                disabled={loading}
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Date
              </label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <ThemeProvider theme={datePickerTheme}>
                  <DatePicker
                    defaultValue={dayjs()}
                    value={dayjs(transactionDate)}
                    onChange={(newValue) => {
                      if (newValue) {
                        setTransactionDate(newValue.toDate());
                      } else {
                        setTransactionDate(new Date());
                      }
                    }}
                    format="MMMM D, YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                      field: {
                        className: "text-slate-900",
                      },
                      popper: {
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, 8],
                            },
                          },
                        ],
                      },
                    }}
                  />
                </ThemeProvider>
              </LocalizationProvider>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-medium text-slate-900">
                  $
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2.5 text-right text-2xl font-medium border border-slate-200 rounded-xl outline-none focus:border-green-600 transition-colors text-slate-900 placeholder:text-slate-400"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
