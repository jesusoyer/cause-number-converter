"use client";
import React, { useState } from "react";

interface Conversion {
  label: string;
  value: string;
}

interface CaseResult {
  id: number;
  raw: string;
  normalized?: string; // core digits/sequence
  facts?: string;      // FACTS-style full string
  year?: string;
  court?: string;      // also used as "location/system"
  conversions?: Conversion[]; // other possible numbers/forms
}

const CaseNumberField = () => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<CaseResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Strip everything except digits
  function normalizeCaseNumber(raw: string) {
    return String(raw).replace(/\D/g, "");
  }

  function lastTwoDigitsOfYear(year: number | string) {
    const y = String(year);
    return y.length > 2 ? y.slice(-2) : y.padStart(2, "0");
  }

  function convertCauseNumber(raw: string): CaseResult {
    const trimmedRaw = raw.trim();
    let upperRaw = trimmedRaw.toUpperCase();

    const base: CaseResult = {
      id: Date.now() + Math.random(),
      raw,
      court: "",
      conversions: []
    };

    // Normalize to alphanumeric for prefix checks
    const alnum = upperRaw.replace(/[^A-Z0-9]/g, "");

    // 🔹 0) CIVIL: D-1-GN or compact D1GN → "this is a civil case number"
    if (alnum.startsWith("D1GN")) {
      // Try to parse year + sequence if it’s in D-1-GN-YY-XXXXXX format
      const civilPattern = /^D-1-GN-(\d{2})-(\d+)/i;
      const civilMatch = upperRaw.match(civilPattern);

      let yearStr: string | undefined;
      let seq: string | undefined;

      if (civilMatch) {
        const yy = Number(civilMatch[1]);
        const fullYear = yy >= 80 ? 1900 + yy : 2000 + yy;
        yearStr = String(fullYear);
        seq = civilMatch[2];
      }

      return {
        ...base,
        facts: upperRaw,
        normalized: seq,
        year: yearStr,
        court: "Civil case number (D-1-GN)",
        conversions: []
      };
    }

    // 🔹 1) Compact FACTS like "d1dc05987678" → expand to D-1-DC-05-987678
    const compactFactsPattern = /^D1DC(\d{2})(\d{5,6})$/;
    const compactMatch = alnum.match(compactFactsPattern);

    if (compactMatch) {
      const yearPart = compactMatch[1]; // "05"
      const seqPart = compactMatch[2];  // "987678"
      upperRaw = `D-1-DC-${yearPart}-${seqPart}`;
    }

    // 🔹 2) FACTS-style input: D-1-DC-YY-XXXXX/XXXXXX
    const factsPattern = /^D-1-DC-(\d{2})-(\d{5,6})$/i;
    const factsMatch = upperRaw.match(factsPattern);

    if (factsMatch) {
      const yearSuffix = factsMatch[1];
      const seq = factsMatch[2];
      const yyNum = Number(yearSuffix);

      // Map 2-digit year -> full year:
      let fullYear: number;
      if (yyNum >= 80) {
        fullYear = 1900 + yyNum;
      } else {
        fullYear = 2000 + yyNum;
      }

      const currentYear = new Date().getFullYear();
      const conversions: Conversion[] = [];

      if (fullYear < 1990) {
        conversions.push({
          label: "Microfilm / Tablet (pre-1990)",
          value: seq
        });
      } else if (fullYear >= 1990 && fullYear <= 2000) {
        conversions.push({
          label: "Microfilm / Tablet / Shelf (1990–2000)",
          value: seq
        });
      } else if (fullYear >= 2001 && fullYear <= 2004 && seq.length === 6) {
        const shelf7 =
          seq[0] + yearSuffix[0] + yearSuffix[1] + seq.slice(2);
        conversions.push({
          label: "Shelf / Offsite / OnBase (7-digit)",
          value: shelf7
        });
      } else if (fullYear >= 2005 && fullYear <= 2009) {
        conversions.push({
          label: "Shelf / Offsite / OnBase / Lists (same number)",
          value: seq
        });
      } else if (fullYear >= 2010 && fullYear <= currentYear) {
        // FACTS only – no extra conversions
      }

      let courtLabel = "FACTS";
      if (fullYear >= 2010) {
        courtLabel = "FACTS only";
      } else if (fullYear >= 2005) {
        courtLabel =
          "Shelf / Offsite / OnBase / Sam / Linda's List / FACTS";
      } else if (fullYear >= 2001) {
        courtLabel = "FACTS / Shelf (2001–2004)";
      } else if (fullYear >= 1990 && fullYear <= 2000) {
        courtLabel = "FACTS / Microfilm / Shelf (1990–2000)";
      } else if (fullYear >= 1980 && fullYear < 1990) {
        courtLabel = "FACTS / Microfilm (pre-1990)";
      }

      return {
        ...base,
        normalized: seq,
        facts: upperRaw,
        year: String(fullYear),
        court: courtLabel,
        conversions
      };
    }

    // 🔹 3) Non-FACTS inputs -> numeric rules
    const digits = normalizeCaseNumber(raw);

    // 5-digit: pre-1990 microfilm
    if (digits.length === 5) {
      const year = 1985;
      const yy = lastTwoDigitsOfYear(year);
      const factsValue = `D-1-DC-${yy}-${digits.padStart(5, "0")}`;

      return {
        ...base,
        normalized: digits,
        facts: factsValue,
        year: String(year),
        court: "FACTS / Microfilm (pre-1990)",
        conversions: [
          {
            label: "Microfilm / Tablet (5-digit)",
            value: digits
          }
        ]
      };
    }

    // 6-digit: microfilm/tablets/shelf
    // New rule: if it's 6 digits and starts with 9,
    // the first two digits ARE the year (YY).
    if (digits.length === 6) {
      if (digits.startsWith("9")) {
        const yearSuffix = digits.slice(0, 2); // e.g. "91", "93"
        const yyNum = Number(yearSuffix);

        // Map 2-digit year to full year
        const fullYear = yyNum >= 80 ? 1900 + yyNum : 2000 + yyNum;

        const factsValue = `D-1-DC-${yearSuffix}-${digits}`;

        let courtLabel = "";
        if (fullYear < 1990) {
          courtLabel = "FACTS / Microfilm (pre-1990)";
        } else if (fullYear >= 1990 && fullYear <= 2000) {
          courtLabel = "FACTS / Microfilm / Shelf (1990–2000)";
        } else {
          courtLabel = "FACTS (6-digit)";
        }

        return {
          ...base,
          normalized: digits,      // core sequence: 914954, 935913, etc.
          facts: factsValue,       // D-1-DC-91-914954, D-1-DC-93-935913
          year: String(fullYear),  // 1991, 1993, etc.
          court: courtLabel,
          conversions: [
            {
              label: "Microfilm / Tablet / Shelf (6-digit)",
              value: digits
            }
          ]
        };
      }

      // If it's 6 digits but DOESN'T start with 9,
      // keep a generic 1990 mapping (old behavior, simplified).
      const year = 1990;
      const yy = lastTwoDigitsOfYear(year);
      const factsValue = `D-1-DC-${yy}-${digits}`;

      return {
        ...base,
        normalized: digits,
        facts: factsValue,
        year: String(year),
        court: "FACTS / Microfilm (1990)",
        conversions: [
          {
            label: "Microfilm / Tablet / Shelf (6-digit)",
            value: digits
          }
        ]
      };
    }

    // 7-digit: 2001–2004
    if (digits.length === 7) {
      const yearSuffix = digits.slice(1, 3);
      const yearNum = 2000 + Number(yearSuffix);

      const case6 = digits[0] + digits[1] + digits.slice(3);
      const factsValue = `D-1-DC-${yearSuffix}-${case6}`;

      return {
        ...base,
        normalized: digits,
        facts: factsValue,
        year: String(yearNum),
        court: "FACTS / Shelf (2001–2004)",
        conversions: [
          {
            label: "FACTS sequence (6-digit)",
            value: case6
          }
        ]
      };
    }

    // Fallback
    return {
      ...base,
      normalized: digits || upperRaw,
      facts: undefined,
      year: "",
      court: "Unrecognized pattern",
      conversions: []
    };
  }

  function handleConvert() {
    const raw = input.trim();
    if (!raw) return;

    // 🔹 Letter guard: only allow D, C, G, N if letters present
    const letters = raw.toUpperCase().replace(/[^A-Z]/g, "");
    if (letters && !/^[DCGN]+$/.test(letters)) {
      setError("This cause/case number isn't ours (invalid letters).");
      return;
    }

    setError(null);

    const convertedItem = convertCauseNumber(raw);
    setResults((prev) => [convertedItem, ...prev]);
    setInput("");
  }

  function deleteCard(id: number) {
    setResults((prev) => prev.filter((item) => item.id !== id));
  }

  function clearAll() {
    setResults([]);
    setError(null);
  }

  // Helper: decide color + label for 2002/2003/2004
  function getYearColor(year?: string) {
    if (!year) return null;

    if (year === "2002") {
      return {
        name: "Yellow",
        dotClass: "bg-yellow-500",
        pillClass: "bg-yellow-100 text-yellow-800 border border-yellow-300"
      };
    }
    if (year === "2003") {
      return {
        name: "Gray",
        dotClass: "bg-gray-500",
        pillClass: "bg-gray-100 text-gray-800 border border-gray-300"
      };
    }
    if (year === "2004") {
      return {
        name: "Green",
        dotClass: "bg-green-500",
        pillClass: "bg-green-100 text-green-800 border border-green-300"
      };
    }
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center mt-10 px-4">
      {/* Input + Buttons */}
      <div className="w-full max-w-md flex flex-col gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleConvert();
            }
          }}
          placeholder="Enter case number or FACTS (e.g. D-1-DC-05-123456, d1dc05987678, D-1-GN-05-123456)..."
          className="w-full px-4 py-3 border rounded-lg shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-green-600"
        />

        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex gap-2 mt-1">
          <button
            onClick={handleConvert}
            className="flex-1 bg-green-600 text-white font-semibold py-3 
            rounded-lg hover:bg-green-700 transition"
          >
            Convert
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

      {/* Results Grid */}
      <div
        className="w-full max-w-6xl mt-10 grid 
        grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7"
      >
        {results.map((item) => {
          const yearColor = getYearColor(item.year);

          return (
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

              {/* Top meta bar: year + file color + location */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] text-gray-500 uppercase">
                    Year
                  </div>
                  <div className="font-semibold text-sm">
                    {item.year || "—"}
                  </div>

                  {yearColor && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-500 text-[11px] uppercase">
                        File color
                      </span>
                      <span
                        className={`inline-flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full ${yearColor.pillClass}`}
                      >
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${yearColor.dotClass}`}
                        />
                        <span>{yearColor.name}</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-gray-500 uppercase">
                    Location / System
                  </div>
                  <div className="font-semibold text-xs">
                    {item.court || "—"}
                  </div>
                </div>
              </div>

              {/* FACTS big at center if present */}
              {item.facts && (
                <div>
                  <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">
                    {item.court?.includes("Civil")
                      ? "Civil cause number"
                      : "FACTS Cause Number"}
                  </div>
                  <div className="font-mono text-lg font-semibold tracking-wide 
                                  bg-gray-100 rounded-md px-3 py-2 break-all">
                    {item.facts}
                  </div>
                </div>
              )}

              {/* Original + Core sequence grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] text-gray-500 uppercase tracking-wide">
                    Original input
                  </div>
                  <div className="font-mono text-sm font-semibold break-all">
                    {item.raw}
                  </div>
                </div>

                {item.normalized && (
                  <div>
                    <div className="text-[11px] text-gray-500 uppercase tracking-wide">
                      Core sequence
                    </div>
                    <div className="font-mono text-sm font-semibold 
                                    bg-gray-100 rounded-md px-2 py-1 break-all">
                      {item.normalized}
                    </div>
                  </div>
                )}
              </div>

              {/* Other conversions */}
              {item.conversions && item.conversions.length > 0 && (
                <div>
                  <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">
                    Other conversions
                  </div>
                  <div className="space-y-1">
                    {item.conversions.map((conv, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col text-xs sm:flex-row sm:items-center sm:gap-1"
                      >
                        <span className="text-gray-500">
                          {conv.label}:
                        </span>
                        <span className="font-mono text-sm font-semibold 
                                         bg-gray-100 rounded px-2 py-0.5">
                          {conv.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CaseNumberField;
