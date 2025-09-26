import { useState, useEffect } from 'react';
import { Instrument, Position, CandlestickData } from '@/types/trading';

// Mock instruments data
const mockInstruments: Instrument[] = [
  {
    id: 'gbpjpy',
    symbol: 'GBP/JPY',
    name: 'British Pound vs Japanese Yen',
    flag: '🇬🇧🇯🇵',
    bid: 193.221,
    ask: 193.231,
    change: 0.123,
    changePercent: 0.064,
    isFavorite: true,
  },
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    flag: '₿',
    bid: 110893.32,
    ask: 110911.32,
    change: 1250.45,
    changePercent: 1.15,
    isFavorite: true,
  },
  {
    id: 'xauusd',
    symbol: 'XAU/USD',
    name: 'Gold vs US Dollar',
    flag: '🥇🇺🇸',
    bid: 3738.635,
    ask: 3738.795,
    change: -12.45,
    changePercent: -0.33,
    isFavorite: false,
  },
  {
    id: 'usdjpy',
    symbol: 'USD/JPY',
    name: 'US Dollar vs Japanese Yen',
    flag: '🇺🇸🇯🇵',
    bid: 149.221,
    ask: 149.231,
    change: -0.003,
    changePercent: -0.002,
    isFavorite: true,
  },
  {
    id: 'aapl',
    symbol: 'AAPL',
    name: 'Apple Inc',
    flag: '🍎',
    bid: 252.65,
    ask: 252.85,
    change: -1.25,
    changePercent: -0.49,
  },
  {
    id: 'eurusd',
    symbol: 'EUR/USD',
    name: 'Euro vs US Dollar',
    flag: '🇪🇺🇺🇸',
    bid: 1.17004,
    ask: 1.17012,
    change: 0.0023,
    changePercent: 0.20,
  },
  {
    id: 'gbpusd',
    symbol: 'GBP/USD',
    name: 'British Pound vs US Dollar',
    flag: '🇬🇧🇺🇸',
    bid: 1.33838,
    ask: 1.33848,
    change: 0.0045,
    changePercent: 0.34,
  },
  {
    id: 'ustec',
    symbol: 'USTEC',
    name: 'US Tech 100',
    flag: '📈',
    bid: 24356.98,
    ask: 24357.68,
    change: -125.45,
    changePercent: -0.51,
  },
  {
    id: 'usoil',
    symbol: 'USOIL',
    name: 'US Oil',
    flag: '🛢️',
    bid: 64.312,
    ask: 64.330,
    change: 0.89,
    changePercent: 1.40,
  },
];

// Generate mock candlestick data
const generateCandlestickData = (basePrice: number, count: number = 200): CandlestickData[] => {
  const data: CandlestickData[] = [];
  let currentPrice = basePrice;
  const now = Date.now();
  
  for (let i = count; i >= 0; i--) {
    const timestamp = now - (i * 60000); // 1 minute intervals
    const volatility = basePrice * 0.001; // 0.1% volatility
    
    const open = currentPrice;
    const close = open + (Math.random() - 0.5) * volatility * 4;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;
    const volume = Math.random() * 1000 + 500;
    
    data.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    });
    
    currentPrice = close;
  }
  
  return data;
};

export const useTradingData = () => {
  const [instruments, setInstruments] = useState<Instrument[]>(mockInstruments);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<string>('usdjpy');
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setInstruments(prev => prev.map(instrument => {
        const volatility = instrument.bid * 0.0001; // 0.01% volatility
        const change = (Math.random() - 0.5) * volatility * 2;
        const newBid = instrument.bid + change;
        const newAsk = newBid + (instrument.ask - instrument.bid);
        
        return {
          ...instrument,
          bid: Number(newBid.toFixed(instrument.symbol.includes('/') ? 5 : 2)),
          ask: Number(newAsk.toFixed(instrument.symbol.includes('/') ? 5 : 2)),
          change: Number(change.toFixed(instrument.symbol.includes('/') ? 5 : 2)),
          changePercent: Number((change / instrument.bid * 100).toFixed(3)),
        };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Generate candlestick data for selected instrument
  useEffect(() => {
    const instrument = instruments.find(i => i.id === selectedInstrument);
    if (instrument) {
      setCandlestickData(generateCandlestickData(instrument.bid));
    }
  }, [selectedInstrument, instruments]);

  const addPosition = (order: {
    instrument: string;
    type: 'buy' | 'sell';
    volume: number;
    takeProfit?: number;
    stopLoss?: number;
  }) => {
    const instrument = instruments.find(i => i.id === order.instrument);
    if (!instrument) return;

    const position: Position = {
      id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      instrument: instrument.symbol,
      type: order.type,
      volume: order.volume,
      openPrice: order.type === 'buy' ? instrument.ask : instrument.bid,
      currentPrice: order.type === 'buy' ? instrument.bid : instrument.ask,
      profit: 0,
      timestamp: new Date(),
      takeProfit: order.takeProfit,
      stopLoss: order.stopLoss,
    };

    setPositions(prev => [...prev, position]);
  };

  const closePosition = (positionId: string) => {
    setPositions(prev => prev.filter(pos => pos.id !== positionId));
  };

  return {
    instruments,
    positions,
    selectedInstrument,
    setSelectedInstrument,
    candlestickData,
    addPosition,
    closePosition,
  };
};