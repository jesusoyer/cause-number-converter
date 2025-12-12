"use client";
import React, { useState } from "react";

interface NameResult {
  id: number;
  raw: string;
  parts: string[];
  variations: string[];
}

// Generate all permutations of 1..N parts
function getAllNameVariations(parts: string[]): string[] {
  const used = new Array(parts.length).fill(false);
  const current: string[] = [];
  const results: string[] = [];

  function backtrack() {
    if (current.length > 0) {
      results.push(current.join(" "));
    }
    if (current.length === parts.length) return;

    for (let i = 0; i < parts.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      current.push(parts[i]);
      backtrack();
      current.pop();
      used[i] = false;
    }
  }

  backtrack();
  return Array.from(new Set(results));
}

// More robust copy helper: Clipboard API + fallback
function copyToClipboardSafe(text: string) {
  if (typeof window === "undefined") return;

  if (navigator && "clipboard" in navigator && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }

  function fallbackCopy(value: string) {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    } catch {
      // ignore if even fallback fails
    }
  }
}

const NameVariationApp = () => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<NameResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lockFirst, setLockFirst] = useState(false);       // keep first name in place
  const [autoCapsCopy, setAutoCapsCopy] = useState(false); // auto ALL CAPS & copy

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    if (autoCapsCopy) {
      const upper = value.toUpperCase();
      setInput(upper);
      if (error) setError(null);
      copyToClipboardSafe(upper);
    } else {
      setInput(value);
      if (error) setError(null);
    }
  }

  function handleGenerate() {
    const raw = input.trim().replace(/\s+/g, " ");
    if (!raw) {
      setError("Please enter a name.");
      return;
    }

    const upper = raw.toUpperCase();
    const parts = upper.split(" ").filter(Boolean);

    if (parts.length > 7) {
      setError("Please enter 7 or fewer name parts to avoid too many variations.");
      return;
    }

    let variations: string[];

    if (lockFirst && parts.length > 1) {
      const [first, ...rest] = parts;
      const restVariations = getAllNameVariations(rest);
      const combined = restVariations.map((v) => `${first} ${v}`);
      variations = Array.from(new Set([first, ...combined]));
    } else {
      variations = getAllNameVariations(parts);
    }

    setError(null);
    setResults((prev) => [
      {
        id: Date.now() + Math.random(),
        raw: upper,
        parts,
        variations,
      },
      ...prev,
    ]);
    setInput("");

    if (autoCapsCopy) {
      copyToClipboardSafe(upper);
    }
  }

  function deleteCard(id: number) {
    setResults((prev) => prev.filter((item) => item.id !== id));
  }

  function clearAll() {
    setResults([]);
    setError(null);
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
      {/* Top block: input + toggles + buttons, centered */}
      <div className="w-full pt-10">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-md px-4 flex flex-col gap-2">
            <input
              type="text"
              value={input}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder="Enter full name or header (e.g. jesus santiago delarosa esparza)..."
              className="w-full px-4 py-3 border rounded-lg shadow-sm 
              bg-white
              focus:outline-none focus:ring-2 focus:ring-green-600"
            />

            {/* Toggles */}
            <div className="flex flex-col gap-1 text-xs text-gray-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lockFirst}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setLockFirst(checked);
                    if (checked) {
                      setAutoCapsCopy(false);
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span>Keep first name in place (for variations)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCapsCopy}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setAutoCapsCopy(checked);
                    if (checked) {
                      setLockFirst(false);
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span>AUTO ALL-CAPS & copy while typing</span>
              </label>
            </div>

            {error && (
              <div className="text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-2 mt-1">
              <button
                onClick={handleGenerate}
                className="flex-1 bg-green-600 text-white font-semibold py-3 
                rounded-lg hover:bg-green-700 transition"
              >
                Generate variations
              </button>

              <button
                onClick={clearAll}
                disabled={results.length === 0}
                className={`px-4 py-3 rounded-lg font-semibold border text-sm transition
                  ${
                    results.length === 0
                      ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                      : "border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                  }`}
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid block: full-width, up to 4 columns, uses whole page */}
      <div className="w-full flex-1 mt-10 mb-10 px-4">
        <div
          className="
            w-full
            grid
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            gap-7
          "
        >
          {results.map((item) => (
            <div
              key={item.id}
              className="relative border rounded-2xl p-6 shadow-md bg-white
                         flex flex-col gap-5 min-h-[280px]"
            >
              {/* Delete X */}
              <button
                onClick={() => deleteCard(item.id)}
                className="absolute top-3 right-3 text-sm font-bold 
                text-gray-500 hover:text-red-600"
              >
                ✕
              </button>

              {/* Top meta: name parts + variation count */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] text-gray-500 uppercase">
                    Name parts
                  </div>
                  <div className="font-semibold text-sm">
                    {item.parts.length}
                  </div>

                  <div className="mt-1">
                    <div className="text-[11px] text-gray-500 uppercase">
                      Parts breakdown
                    </div>
                    <div className="text-xs text-gray-700 break-words">
                      {item.parts.join(" • ")}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-gray-500 uppercase">
                    Total variations
                  </div>
                  <div className="font-mono text-sm font-semibold">
                    {item.variations.length}
                  </div>
                </div>
              </div>

              {/* Original input */}
              <div>
                <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">
                  Original input (ALL CAPS)
                </div>
                <div className="font-mono text-lg font-semibold tracking-wide 
                                bg-gray-100 rounded-md px-3 py-2 break-all">
                  {item.raw}
                </div>
              </div>

              {/* Variations */}
              {item.variations.length > 0 && (
                <div>
                  <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">
                    Name variations
                  </div>
                  <div className="space-y-1 max-h-40 overflow-auto">
                    {item.variations.map((nameVar, idx) => (
                      <div
                        key={idx}
                        className="font-mono text-sm bg-gray-100 rounded px-2 py-1 break-words"
                      >
                        {nameVar}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NameVariationApp;
