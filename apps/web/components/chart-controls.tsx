import { Symbol, Interval } from "@/types/candle";

interface ChartControlsProps {
  symbol: Symbol;
  interval: Interval;
  setSymbol: (symbol: Symbol) => void;
  setInterval: (interval: Interval) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export function ChartControls({ symbol, interval, setSymbol, setInterval, isLoading, onRefresh }: ChartControlsProps) {
  return (
    <div className="p-4 border-b border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Symbol:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setSymbol("SOLUSDT")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                symbol === "SOLUSDT" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              SOL/USDT
            </button>
            <button
              onClick={() => setSymbol("BTCUSDT")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                symbol === "BTCUSDT" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              BTC/USDT
            </button>
            <button
              onClick={() => setSymbol("ETHUSDT")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                symbol === "ETHUSDT" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              ETH/USDT
            </button>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-3 py-1.5 text-xs rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-700"
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <span className="text-gray-400 text-sm">Interval:</span>
        <div className="flex gap-1">
          <button
            onClick={() => setInterval("1m")}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              interval === "1m" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            1m
          </button>
          <button
            onClick={() => setInterval("5m")}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              interval === "5m" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            5m
          </button>
          <button
            onClick={() => setInterval("10m")}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              interval === "10m" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            10m
          </button>
          <button
            onClick={() => setInterval("30m")}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              interval === "30m" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            30m
          </button>
          <button
            onClick={() => setInterval("1hour")}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              interval === "1hour" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            1h
          </button>
          <button
            onClick={() => setInterval("1day")}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              interval === "1day" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            1d
          </button>
        </div>
      </div>
    </div>
  );
}
