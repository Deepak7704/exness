import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi } from "lightweight-charts";
import { BackendCandleData, Interval, Symbol } from "@/types/candle";

export function useTradingChart(symbol: Symbol, interval: Interval) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCandleData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3000/api/candles/${symbol}/${interval}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch candle data");
      }

      const data: BackendCandleData[] = await response.json();

      if (data && data.length > 0) {
        updateChart(data);
      }
    } catch (error) {
      console.error("[v0] Error fetching candle data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateChart = (data: BackendCandleData[]) => {
    if (!candlestickSeriesRef.current) return;

    const formattedData = data
      .map((candle) => ({
        time: Math.floor(new Date(candle.bucket).getTime() / 1000),
        open: Number.parseFloat(candle.open),
        high: Number.parseFloat(candle.high),
        low: Number.parseFloat(candle.low),
        close: Number.parseFloat(candle.close),
      }))
      .sort((a, b) => a.time - b.time);

    candlestickSeriesRef.current.setData(formattedData);
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#9CA3AF",
      },
      grid: {
        vertLines: { color: "#1F2937" },
        horzLines: { color: "#1F2937" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#374151",
      },
      rightPriceScale: {
        borderColor: "#374151",
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "#6B7280",
          width: 1,
          style: 3,
          labelBackgroundColor: "#1F2937",
        },
        horzLine: {
          color: "#6B7280",
          width: 1,
          style: 3,
          labelBackgroundColor: "#1F2937",
        },
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#3B82F6",
      downColor: "#EF4444",
      borderUpColor: "#3B82F6",
      borderDownColor: "#EF4444",
      wickUpColor: "#3B82F6",
      wickDownColor: "#EF4444",
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (candlestickSeriesRef.current) {
      fetchCandleData();
    }
  }, [symbol, interval]);

  return { chartContainerRef, isLoading };
}
