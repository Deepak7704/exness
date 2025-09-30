"use client";

import { useState } from "react";
import { Symbol, Interval, OHLCDisplay as OHLCDisplayType } from "@/types/candle";
import { useTradingChart } from "@/components/use-trading-chart";
import { ChartControls } from "@/components/chart-controls";
import { OHLCDisplay } from "@/components/ohlc-display";

export default function TradingChart() {
  const [symbol, setSymbol] = useState<Symbol>("SOLUSDT");
  const [interval, setInterval] = useState<Interval>("1m");
  const { chartContainerRef, isLoading } = useTradingChart(symbol, interval);
  const [ohlcData, setOhlcData] = useState<OHLCDisplayType>({
    open: "0.00",
    high: "0.00",
    low: "0.00",
    close: "0.00",
    change: "0.00",
    changePercent: "0.00",
  });

  const handleRefresh = () => {
    // The useTradingChart hook handles fetching, so we just need to trigger it
  };

  return (
    <div className="w-full bg-[#0A0E1A] border border-gray-800 rounded-lg">
      <ChartControls
        symbol={symbol}
        interval={interval}
        setSymbol={setSymbol}
        setInterval={setInterval}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />
      <OHLCDisplay data={ohlcData} />
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}