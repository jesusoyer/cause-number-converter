// app/page.tsx

import NavBar from "./components/NavBar";
import CaseNumberField from "./components/CaseNumberField";
import Tabs from "./components/Tabs";
import BacktimeCalculator from "./components/BacktimeCalculator";
import NameIterationApp from "./components/NameIterationApp";

export default function Home() {
  const tabs = [
    {
      id: "overview",
      label: "Case Number Converter",
      content: (
        <div className="h-full p-4">
          <h2 className="text-lg font-semibold mb-4">Case Converter</h2>
          <section className="border rounded-lg p-4">
            <CaseNumberField />
          </section>
        </div>
      ),
    },
    {
      id: "tools",
      label: "Backtime Calculator",
      content: (
        <div className="h-full p-4">
          <h2 className="text-lg font-semibold mb-4">Backtime Calculator</h2>
          <section className="border rounded-lg p-4 max-w-md">
            <BacktimeCalculator />
          </section>
        </div>
      ),
    },
    {
      id: "settings",
      label: "Name Iteration",
      content: (
        <div className="h-full p-4">
          <h2 className="text-lg font-semibold mb-4">Name Iteration</h2>
          <section className="border rounded-lg p-4 max-w-md">
            <NameIterationApp />
          </section>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <Tabs tabs={tabs} defaultTabId="overview" />
      </main>
    </div>
  );
}
