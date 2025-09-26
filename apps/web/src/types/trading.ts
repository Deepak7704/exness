export interface Instrument {
  id: string;
  symbol: string;
  name: string;
  flag?: string;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
  isFavorite?: boolean;
}

export interface Position {
  id: string;
  instrument: string;
  type: 'buy' | 'sell';
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  timestamp: Date;
  takeProfit?: number;
  stopLoss?: number;
}

export interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TimeFrame = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';

export interface OrderForm {
  instrument: string;
  type: 'buy' | 'sell';
  volume: number;
  takeProfit?: number;
  stopLoss?: number;
  orderType: 'market' | 'pending';
}