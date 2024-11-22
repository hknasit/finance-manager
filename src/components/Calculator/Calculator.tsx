import React from "react";

function Calculator({
    handleNumber,
    handleOperation,
    handleEquals,
  }) {
  return (
    <>
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
    </>
  );
}

export default Calculator;
