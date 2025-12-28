"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createChart, IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import { Symbol, Interval, BackendCandleData } from "../types/candles";

interface CandleData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface LiveCandle {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isClosed: boolean;
}

export function useTradingChart(symbol: Symbol, interval: Interval) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastCandleRef = useRef<CandleData | null>(null);
  const liveCandleTimeRef = useRef<number | null>(null);
  const symbolRef = useRef(symbol);
  const intervalRef = useRef(interval);

  // Update refs when symbol/interval changes
  useEffect(() => {
    symbolRef.current = symbol;
    intervalRef.current = interval;
  }, [symbol, interval]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const containerHeight = chartContainerRef.current.clientHeight;
    const containerWidth = chartContainerRef.current.clientWidth;

    const chart = createChart(chartContainerRef.current, {
      width: containerWidth,
      height: containerHeight,
      layout: {
        background: { color: "#0A0E1A" },
        textColor: "#D9D9D9",
      },
      grid: {
        vertLines: { color: "#1E293B" },
        horzLines: { color: "#1E293B" },
      },
      crosshair: { mode: 1 },
      rightPriceScale: {
        borderColor: "#2B3B5F",
        visible: true,
        autoScale: true, // Enable automatic price scaling
        scaleMargins: {
          top: 0.1,    // 10% margin at top
          bottom: 0.1, // 10% margin at bottom
        },
      },
      timeScale: {
        borderColor: "#2B3B5F",
        timeVisible: true,
        secondsVisible: false,
        visible: true,
        borderVisible: true,
        rightOffset: 10,
        barSpacing: 12,
        minBarSpacing: 6,
        lockVisibleTimeRangeOnResize: true, // Prevent zoom reset on resize
      },
      handleScale: {
        axisPressedMouseMove: {
          time: true,  // Enable time scale dragging
          price: true, // Enable price scale dragging
        },
        mouseWheel: true,  // Enable mouse wheel zoom
        pinch: true,       // Enable pinch zoom
      },
      handleScroll: {
        mouseWheel: true,  // Enable mouse wheel scroll
        pressedMouseMove: true, // Enable drag to scroll
        horzTouchDrag: true,    // Enable horizontal touch drag
        vertTouchDrag: true,    // Enable vertical touch drag
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#22C55E",
      downColor: "#EF4444",
      borderUpColor: "#22C55E",
      borderDownColor: "#EF4444",
      wickUpColor: "#22C55E",
      wickDownColor: "#EF4444",
      priceScaleId: "right", // Use right price scale
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        const newWidth = chartContainerRef.current.clientWidth;
        const newHeight = chartContainerRef.current.clientHeight;
        
        chartRef.current.applyOptions({ 
          width: newWidth,
          height: newHeight
        });
      }
    };

    window.addEventListener("resize", handleResize);
    
    // Trigger initial resize after a small delay
    setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // Fetch historical candles from TimescaleDB
  const fetchHistoricalCandles = useCallback(async (limit?: number) => {
    setIsLoading(true);
    try {
      const limitParam = limit ? `?limit=${limit}` : '';
      const response = await fetch(
        `http://localhost:3000/api/candles/${symbolRef.current}/${intervalRef.current}${limitParam}`,
        { credentials: "include" }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: BackendCandleData[] = await response.json();

      console.log(`Fetched ${data.length} candles for ${symbolRef.current} ${intervalRef.current}`);

      if (candleSeriesRef.current && data.length > 0) {
        const formattedCandles: CandleData[] = data.map(candle => ({
          time: Math.floor(new Date(candle.bucket).getTime() / 1000) as UTCTimestamp,
          open: Number(candle.open),
          high: Number(candle.high),
          low: Number(candle.low),
          close: Number(candle.close),
        }));

        // Set historical data
        candleSeriesRef.current.setData(formattedCandles);

        // Store the last historical candle
        lastCandleRef.current = formattedCandles[formattedCandles.length - 1] ?? null;
        liveCandleTimeRef.current = null; // Reset live candle tracking

        chartRef.current?.timeScale().fitContent();
      }
    } catch (err) {
      console.error("Error fetching candles:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount and when symbol/interval changes
  useEffect(() => {
    fetchHistoricalCandles();
  }, [symbol, interval, fetchHistoricalCandles]);

  // Update live candle
  const updateLiveCandle = useCallback((liveCandle: LiveCandle) => {
    if (!candleSeriesRef.current) return;

    const candleTime = Math.floor(liveCandle.openTime / 1000) as UTCTimestamp;
    
    // Don't update if this candle is older than the last one we have
    if (lastCandleRef.current && candleTime < lastCandleRef.current.time) {
      console.log('Skipping old candle:', candleTime, 'Last:', lastCandleRef.current.time);
      return;
    }

    const candleData: CandleData = {
      time: candleTime,
      open: liveCandle.open,
      high: liveCandle.high,
      low: liveCandle.low,
      close: liveCandle.close,
    };

    // Track the current live candle time
    liveCandleTimeRef.current = liveCandle.openTime;

    candleSeriesRef.current.update(candleData);
    lastCandleRef.current = candleData;
  }, []);

  // Add closed candle (when a new candle starts)
  const addClosedCandle = useCallback((closedCandle: LiveCandle) => {
    if (!candleSeriesRef.current) return;

    const candleTime = Math.floor(closedCandle.openTime / 1000) as UTCTimestamp;
    
    // Final update for the closed candle
    const candleData: CandleData = {
      time: candleTime,
      open: closedCandle.open,
      high: closedCandle.high,
      low: closedCandle.low,
      close: closedCandle.close,
    };

    // Update the closed candle with final values
    candleSeriesRef.current.update(candleData);
    
    console.log("Closed candle added to chart:", candleData);
  }, []);

  // Refetch historical data (useful for syncing with database after candle closes)
  const refetchHistoricalData = useCallback((limit?: number) => {
    fetchHistoricalCandles(limit);
  }, [fetchHistoricalCandles]);

  return {
    chartContainerRef,
    isLoading,
    updateLiveCandle,
    addClosedCandle,
    refetchHistoricalData,
  };
}
