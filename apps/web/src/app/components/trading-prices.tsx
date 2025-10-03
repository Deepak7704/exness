'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface PriceData {
  symbol: string;
  price: number;
  buyPrice: number;
  sellPrice: number;
  qty: number;
  time: number;
  tradeId: number;
  timestamp: number;
}

interface DisplayPrice {
  symbol: string;
  displayName: string;
  bid: string;
  ask: string;
  lastPrice: number;
}

export default function TradingPrices() {
  const [prices, setPrices] = useState<DisplayPrice[]>([
    { symbol: 'BTCUSDT', displayName: 'BTC', bid: '0.00', ask: '0.00', lastPrice: 0 },
    { symbol: 'ETHUSDT', displayName: 'ETH', bid: '0.00', ask: '0.00', lastPrice: 0 },
    { symbol: 'SOLUSDT', displayName: 'SOL', bid: '0.00', ask: '0.00', lastPrice: 0 }
  ]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [priceChanges, setPriceChanges] = useState<Record<string, 'up' | 'down' | null>>({});

  useEffect(() => {
    const socketInstance = io('http://localhost:4000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    setSocket(socketInstance);

    socketInstance.on('initial-prices', (initialPrices: Record<string, PriceData>) => {
      console.log('Received initial prices:', initialPrices);
      
      const updatedPrices = prices.map(price => {
        const priceData = initialPrices[price.symbol];
        if (priceData) {
          return {
            ...price,
            bid: priceData.sellPrice.toFixed(2),
            ask: priceData.buyPrice.toFixed(2),
            lastPrice: priceData.price
          };
        }
        return price;
      });
      
      setPrices(updatedPrices);
    });

    socketInstance.on('price-update', ({ symbol, data }: { symbol: string; data: PriceData }) => {
      setPrices(prev => prev.map(price => {
        if (price.symbol === symbol) {
          // Detect price change direction
          const direction = data.price > price.lastPrice ? 'up' : data.price < price.lastPrice ? 'down' : null;
          if (direction) {
            setPriceChanges(changes => ({ ...changes, [symbol]: direction }));
            setTimeout(() => {
              setPriceChanges(changes => ({ ...changes, [symbol]: null }));
            }, 300);
          }

          return {
            ...price,
            bid: data.sellPrice.toFixed(2),
            ask: data.buyPrice.toFixed(2),
            lastPrice: data.price
          };
        }
        return price;
      }));
    });

    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-[#0d0d0f] rounded-xl overflow-hidden border border-[#1a1a1f]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#1a1a1f] bg-[#0a0a0c]">
          <h3 className="text-white text-sm font-semibold tracking-tight">Market Prices</h3>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a1f]">
                <th className="text-left px-4 py-3 text-[#8e8e93] text-xs font-medium uppercase tracking-wider">
                  Symbol
                </th>
                <th className="text-right px-4 py-3 text-[#8e8e93] text-xs font-medium uppercase tracking-wider">
                  Bid
                </th>
                <th className="text-right px-4 py-3 text-[#8e8e93] text-xs font-medium uppercase tracking-wider">
                  Ask
                </th>
              </tr>
            </thead>
            <tbody>
              {prices.map((price, index) => (
                <tr 
                  key={price.symbol}
                  className={`
                    hover:bg-[#14141a] transition-all duration-150
                    ${index !== prices.length - 1 ? 'border-b border-[#1a1a1f]' : ''}
                  `}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1a1a1f]">
                        <span className="text-white text-xs font-bold">
                          {price.displayName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">
                          {price.displayName}
                        </div>
                        <div className="text-[#8e8e93] text-xs">
                          {price.displayName}/USD
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className={`
                      inline-flex items-center justify-end px-3 py-1.5 rounded-md
                      bg-[#1a1a1f] transition-colors duration-300
                      ${priceChanges[price.symbol] === 'down' ? 'bg-red-500/60' : ''}
                      ${priceChanges[price.symbol] === 'up' ? 'bg-green-500/60' : ''}
                    `}>
                      <span className="text-white font-mono text-sm tabular-nums">
                        ${price.bid}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className={`
                      inline-flex items-center justify-end px-3 py-1.5 rounded-md
                      bg-[#1a1a1f] transition-colors duration-300
                      ${priceChanges[price.symbol] === 'up' ? 'bg-green-500/60' : ''}
                      ${priceChanges[price.symbol] === 'down' ? 'bg-red-500/60' : ''}
                    `}>
                      <span className="text-white font-mono text-sm tabular-nums">
                        ${price.ask}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#1a1a1f] bg-[#0a0a0c]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[#8e8e93] text-xs">Live</span>
            </div>
            <span className="text-[#8e8e93] text-xs">Updated in real-time</span>
          </div>
        </div>
      </div>
    </div>
  );
}
