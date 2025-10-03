"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Symbol, Interval, OHLCDisplay as OHLCDisplayType } from "../types/candles";
import { useTradingChart } from "./use-trading-charts";
import { ChartControls } from "./chart-controls";
import { OHLCDisplay } from "./ohlc-display";

interface LiveCandle {
  symbol: string;
  interval: string;
  openTime: number;
  closeTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  trades: number;
  isClosed: boolean;
}

export default function TradingChart() {
  const [symbol, setSymbol] = useState<Symbol>("BTCUSDT");
  const [interval, setInterval] = useState<Interval>("1m");
  const { 
    chartContainerRef, 
    isLoading, 
    updateLiveCandle, 
    addClosedCandle,
    refetchHistoricalData 
  } = useTradingChart(symbol, interval);
  
  const [ohlcData, setOhlcData] = useState<OHLCDisplayType>({
    open: "0.00",
    high: "0.00",
    low: "0.00",
    close: "0.00",
    change: "0.00",
    changePercent: "0.00",
  });

  const socketRef = useRef<Socket | null>(null);
  const previousCandleRef = useRef<LiveCandle | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:4000");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to live candle server");
      socket.emit("subscribe-candles", { asset: symbol, interval });
    });

    socket.on("candle-initial", (candle: LiveCandle) => {
      console.log("Received initial candle:", candle);
      previousCandleRef.current = candle;
      updateOHLCDisplay(candle);
      if (updateLiveCandle) {
        updateLiveCandle(candle);
      }
    });

    socket.on("candle-update", (candle: LiveCandle) => {
      if (candle.symbol === symbol && candle.interval === interval) {
        previousCandleRef.current = candle;
        updateOHLCDisplay(candle);
        if (updateLiveCandle) {
          updateLiveCandle(candle);
        }
      }
    });

    socket.on("candle-closed", (candle: LiveCandle) => {
      if (candle.symbol === symbol && candle.interval === interval) {
        console.log("Candle closed, adding to chart:", candle);
        if (addClosedCandle) {
          addClosedCandle(candle);
        }
      }
    });

    socket.on("candle-error", (error: any) => {
      console.error("Candle error:", error);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from live candle server");
    });

    return () => {
      socket.emit("unsubscribe-candles", { asset: symbol, interval });
      socket.close();
      socketRef.current = null;
    };
  }, [symbol, interval, updateLiveCandle, addClosedCandle]);

  const updateOHLCDisplay = (candle: LiveCandle) => {
    const change = candle.close - candle.open;
    const changePercent = ((change / candle.open) * 100);

    setOhlcData({
      open: candle.open.toFixed(2),
      high: candle.high.toFixed(2),
      low: candle.low.toFixed(2),
      close: candle.close.toFixed(2),
      change: change.toFixed(2),
      changePercent: changePercent.toFixed(2),
    });
  };

  const handleRefresh = () => {
    if (refetchHistoricalData) {
      refetchHistoricalData();
    }
    
    if (previousCandleRef.current) {
      updateOHLCDisplay(previousCandleRef.current);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#101421]">
      <div className="border-b border-gray-800">
        <ChartControls
          symbol={symbol}
          interval={interval}
          setSymbol={setSymbol}
          setInterval={setInterval}
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />
        <OHLCDisplay data={ohlcData} />
      </div>
      
      <div ref={chartContainerRef} className="flex-1 w-full" />
    </div>
  );
}