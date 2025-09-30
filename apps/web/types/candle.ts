export interface BackendCandleData {
  bucket: string; // ISO timestamp string
  open: string;
  high: string;
  low: string;
  close: string;
  quantity: string; // volume
}

export interface OHLCDisplay {
  open: string;
  high: string;
  low: string;
  close: string;
  change: string;
  changePercent: string;
}

export type Symbol = "SOLUSDT" | "BTCUSDT" | "ETHUSDT";
export type Interval = "1m" | "5m" | "10m" | "30m" | "1hour" | "1day";