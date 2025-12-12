"use client";

import { useState, ReactNode } from "react";

type Tab = {
  id: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  defaultTabId?: string;
};

export default function Tabs({ tabs, defaultTabId }: TabsProps) {
  const [activeTabId, setActiveTabId] = useState(
    defaultTabId ?? tabs[0]?.id
  );

  return (
    <div className="h-full flex flex-col">
      {/* Tab buttons */}
      <div
        className="flex border-b gap-2 px-4"
        role="tablist"
        aria-label="Tabs"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              className={`flex-1 text-center px-4 py-3 text-sm border-b-2 -mb-px transition
                ${
                  isActive
                    ? "border-black font-semibold"
                    : "border-transparent text-gray-500 hover:text-black"
                }`}
              onClick={() => setActiveTabId(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* All tab panels stay mounted, we just hide the inactive ones */}
      <div className="flex-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              id={`${tab.id}-panel`}
              role="tabpanel"
              hidden={!isActive}
              className="h-full"
            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
