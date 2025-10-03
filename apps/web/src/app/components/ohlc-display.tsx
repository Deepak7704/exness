import { OHLCDisplay as OHLCDisplayType } from "../types/candles";

interface OHLCDisplayProps {
  data: OHLCDisplayType;
}

export function OHLCDisplay({ data }: OHLCDisplayProps) {
  return (
    <div className="flex items-center gap-6 text-sm p-4">
      <div className="flex items-center gap-2">
        <span className="text-gray-400">O</span>
        <span className="text-white font-mono">{data.open}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-400">H</span>
        <span className="text-white font-mono">{data.high}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-400">L</span>
        <span className="text-white font-mono">{data.low}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-400">C</span>
        <span className="text-white font-mono">{data.close}</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`font-mono ${Number.parseFloat(data.change) >= 0 ? "text-green-500" : "text-red-500"}`}>
          {Number.parseFloat(data.change) >= 0 ? "+" : ""}
          {data.change} ({data.changePercent}%)
        </span>
      </div>
    </div>
  );
}
