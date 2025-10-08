"use client";

import { useState } from 'react';
import TradingChart from "./components/trading-chart";
import InstrumentPanel from "./components/instrument-panel";
import OrderPanel from "./components/order-panel";
import { PositionsPanel } from "./components/positions-panel";
import TradingPrices from "./components/trading-prices";

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [unrealizedPNL, setUnrealizedPNL] = useState(0);
  const [balanceRefreshTrigger,setBalanceRefreshTrigger] = useState(0);

  const handleOrderPlaced = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleBalanceChange = (pnl: number) => {
    setUnrealizedPNL(pnl);
  };

  const handlePositionClosed = () =>{
    setBalanceRefreshTrigger(prev => prev + 1);
    setRefreshTrigger(prev => prev+1)
  }

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#0A0E1A]">
      {/* Left Panel - Instruments */}
      <aside className="w-[280px] h-screen flex-shrink-0 border-r border-gray-800 overflow-y-auto">
        <TradingPrices />
      </aside>

      {/* Center Panel - Trading Chart + Positions */}
      <section className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden">
        {/* Trading Chart - Fixed Height */}
        <div className="h-[60vh] min-h-0 overflow-hidden border-b border-gray-800">
          <TradingChart />
        </div>
        
        {/* Positions Panel - Remaining Space */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <PositionsPanel 
            refreshTrigger={refreshTrigger}
            onBalanceChange={handleBalanceChange}
            onPositionClosed ={handlePositionClosed}
          />
        </div>
      </section>

      {/* Right Panel - Order Entry */}
      <aside className="w-[320px] h-screen flex-shrink-0 border-l border-gray-800 overflow-y-auto">
        <OrderPanel 
          onOrderPlaced={handleOrderPlaced}
          unrealizedPNL={unrealizedPNL}
          balanceRefreshTrigger = {balanceRefreshTrigger}
        />
      </aside>
    </main>
  );
}
