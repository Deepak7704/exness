import type { User, OpenOrder, ClosedOrder, OrderType } from '@prisma/client';

export interface AgentQuery {
  input: string;
  userId: string;
}

export interface AgentResponse {
  success: boolean;
  answer: string;
  toolsUsed?: string[];
  reasoning?: any[];
  metadata?: {
    tokensUsed?: number;
    latency?: number;
  };
}

export type { User, OpenOrder, ClosedOrder, OrderType };

export interface Candle {
  time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface RSIResult {
  value: number;
  interpretation: string;
  signal: string;
  momentum: string;
}

export interface SupportResistance {
  support: number[];
  resistance: number[];
  currentPrice: number;
  nearestSupport?: number;
  nearestResistance?: number;
  distanceToSupport?: number;
  distanceToResistance?: number;
  riskReward?: number;
  analysis: string;
}

export interface PortfolioRisk {
  totalBalance: number;
  usedMargin: number;
  availableBalance: number;
  symbolExposure: number;
  symbolExposurePercentage: number;
  riskLevel: 'LOW' | 'ACCEPTABLE' | 'MODERATE' | 'HIGH';
  recommendation: string;
  availableCapital: number;
}

