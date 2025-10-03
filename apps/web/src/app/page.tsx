import TradingChart from "./components/trading-chart";
import InstrumentPanel from "./components/instrument-panel";
import OrderPanel from "./components/order-panel";
import { PositionsPanel } from "./components/positions-panel";
import TradingPrices from "./components/trading-prices";

export default function Home() {
  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#0A0E1A]">
      {/* Left Panel - Instruments */}
      <aside className="w-[280px] flex-shrink-0 border-r border-gray-800 overflow-y-auto">
        <TradingPrices />
      </aside>

      {/* Center Panel - Trading Chart + Positions */}
      <section className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-hidden">
          <TradingChart />
        </div>
        <PositionsPanel />
      </section>

      {/* Right Panel - Order Entry */}
      <aside className="w-[320px] flex-shrink-0 border-l border-gray-800 overflow-y-auto">
        <OrderPanel />
      </aside>
    </main>
  );
}