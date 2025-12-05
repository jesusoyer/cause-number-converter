"use client"; 
import React, { useState } from "react";

const CaseNumberField = () => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);

  // 👉 Replace this with your real conversion logic
  function convertCauseNumber(raw) {
    return {
      id: Date.now() + Math.random(),
      raw,
      formatted: raw.trim().toUpperCase(),
      year: "2025",
      court: "Demo Court",
      county: "Demo County"
    };
  }

  function handleConvert() {
    if (!input.trim()) return;

    const converted = convertCauseNumber(input);
    setResults((prev) => [converted, ...prev]);
    setInput("");
  }

  function deleteCard(id) {
    setResults((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="w-full flex flex-col items-center mt-10 px-4">

      {/* Input + Button */}
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter case number..."
          className="w-full px-4 py-3 border rounded-lg shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-green-600"
        />

        <button
          onClick={handleConvert}
          className="w-full bg-green-600 text-white font-semibold py-3 
          rounded-lg hover:bg-green-700 transition"
        >
          Convert
        </button>

      </div>

      {/* Results Grid */}
      <div className="w-full max-w-6xl mt-10 grid 
        grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {results.map((item) => (
          <div 
            key={item.id}
            className="relative border rounded-xl p-4 shadow-sm bg-white"
          >

            {/* Delete X */}
            <button
              onClick={() => deleteCard(item.id)}
              className="absolute top-2 right-2 text-sm font-bold 
              text-gray-500 hover:text-red-600"
            >
              ✕
            </button>

            <div className="text-xs text-gray-500">Original</div>
            <div className="font-mono text-sm mb-3 break-all">{item.raw}</div>

            <div className="text-xs text-gray-500">Formatted</div>
            <div className="font-mono text-sm mb-3 break-all">{item.formatted}</div>

            <div className="grid grid-cols-2 gap-2 text-xs mt-2">
              <div>
                <div className="text-gray-500">Year</div>
                <div className="font-semibold">{item.year}</div>
              </div>

              <div>
                <div className="text-gray-500">Court</div>
                <div className="font-semibold">{item.court}</div>
              </div>

              <div>
                <div className="text-gray-500">County</div>
                <div className="font-semibold">{item.county}</div>
              </div>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
};

export default CaseNumberField;

