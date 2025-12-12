"use client";

import { useState } from "react";

export default function BacktimeCalculator() {
  const [end, setEnd] = useState("");
  const [hours, setHours] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleCalculate() {
    setError(null);
    setResult(null);

    if (!end || !hours) {
      setError("Please fill in both fields.");
      return;
    }

    const endDate = new Date(end);
    if (isNaN(endDate.getTime())) {
      setError("Invalid end date/time.");
      return;
    }

    const hrs = Number(hours);
    if (Number.isNaN(hrs)) {
      setError("Hours must be a number.");
      return;
    }

    const startDate = new Date(endDate.getTime() - hrs * 60 * 60 * 1000);
    setResult(startDate.toLocaleString());
  }

  function handleClear() {
    setEnd("");
    setHours("");
    setResult(null);
    setError(null);
  }

  return (
    <div className="relative space-y-3">
      {/* Top-right clear button */}
      <button
        type="button"
        onClick={handleClear}
        className="absolute top-0 right-0 text-xs text-gray-500 hover:text-black"
      >
        Clear
      </button>

      <h3 className="font-semibold text-sm mb-1">Backtime Calculator</h3>

      <label className="block text-xs font-medium">
        End date & time
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="mt-1 w-full border rounded px-2 py-1 text-sm"
        />
      </label>

      <label className="block text-xs font-medium">
        Hours to subtract
        <input
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="mt-1 w-full border rounded px-2 py-1 text-sm"
        />
      </label>

      <button
        onClick={handleCalculate}
        className="mt-1 w-full border rounded px-2 py-1 text-sm hover:bg-gray-100"
      >
        Calculate
      </button>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {result && (
        <p className="text-xs mt-1">
          Start time: <span className="font-medium">{result}</span>
        </p>
      )}
    </div>
  );
}
