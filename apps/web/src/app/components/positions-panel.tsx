"use client"
import { useState, useEffect } from 'react';
import { io, Socket } from "socket.io-client"; // ADD THIS IMPORT




interface OpenOrder {
  id: string;
  asset: string;
  type: 'BUY' | 'SELL';
  boughtPrice: number;
  qty: number;
  margin: number;
  createdAt: string;
}

interface ClosedOrder {
  id: string;
  asset: string;
  type: 'BUY' | 'SELL';
  boughtPrice: number;
  closedPrice: number;
  qty: number;
  margin: number;
  pnl: number;
  openTime: string;
  closedAt: string;
}

interface PositionsPanelProps {
  refreshTrigger?: number;
  onBalanceChange?: (unrealizedPNL: number) => void;
  onPositionClosed?: () => void;
}

export function PositionsPanel({ refreshTrigger, onBalanceChange, onPositionClosed }: PositionsPanelProps) {
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);
  const [closedOrders, setClosedOrders] = useState<ClosedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [closingOrderId, setClosingOrderId] = useState<string | null>(null);
  
  // ADD THESE STATE VARIABLES
  const [livePrices, setLivePrices] = useState<Map<string, number>>(new Map());
  const [socket, setSocket] = useState<Socket | null>(null);

  // ADD THIS: Setup Socket.IO for live prices
  useEffect(() => {
    const socketInstance = io("http://localhost:4000", {
      transports: ["websocket"],
      reconnection: true,
    });

    setSocket(socketInstance);

    socketInstance.on("initial-prices", (prices: Record<string, any>) => {
      const priceMap = new Map<string, number>();
      Object.entries(prices).forEach(([symbol, data]) => {
        priceMap.set(symbol, data.price);
      });
      setLivePrices(priceMap);
    });

    socketInstance.on("price-update", ({ symbol, data }: { symbol: string; data: any }) => {
      setLivePrices((prev) => {
        const newMap = new Map(prev);
        newMap.set(symbol, data.price);
        return newMap;
      });
    });

    socketInstance.on("connect", () => {
      console.log("Connected to price server");
    });

    return () => {
      socketInstance.close();
    };
  }, []);

  // ADD THIS: Calculate PNL for a single order
  const calculateOrderPNL = (order: OpenOrder) => {
    const currentPrice = livePrices.get(order.asset) || order.boughtPrice;
    
    let pnl: number;
    if (order.type === "BUY") {
      pnl = (currentPrice - order.boughtPrice) * order.qty;
    } else {
      pnl = (order.boughtPrice - currentPrice) * order.qty;
    }

    const pnlPercent = (pnl / order.margin) * 100;

    return {
      currentPrice,
      pnl,
      pnlPercent,
      isProfit: pnl >= 0,
    };
  };

  // ADD THIS: Calculate total unrealized PNL
  const calculateTotalPNL = () => {
    return openOrders.reduce((total, order) => {
      const { pnl } = calculateOrderPNL(order);
      return total + pnl;
    }, 0);
  };

  // ADD THIS: Notify parent component when PNL changes
  useEffect(() => {
    if (onBalanceChange) {
      const totalPNL = calculateTotalPNL();
      onBalanceChange(totalPNL);
    }
  }, [openOrders, livePrices, onBalanceChange]);

  // Fetch open positions
  const fetchOpenPositions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch('http://localhost:3000/api/orders/open', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOpenOrders(data.openOrders || []);
      }
    } catch (error) {
      console.error('Failed to fetch open positions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch closed positions
  const fetchClosedPositions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch('http://localhost:3000/api/orders/close', {
        method:'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClosedOrders(data.closedOrders || []);
      }
    } catch (error) {
      console.error('Failed to fetch closed positions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Close an order
  const handleCloseOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to close this position?')) return;

    setClosingOrderId(orderId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        return;
      }

      const response = await fetch('http://localhost:3000/api/orders/close', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to close order');
      }

      alert(`Position closed! P&L: ${data.closedOrder.pnl >= 0 ? '+' : ''}${data.closedOrder.pnl} USD`);


      await Promise.all([
        fetchOpenPositions(),
        fetchClosedPositions()
      ])
      if(onPositionClosed){
        onPositionClosed();
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to close position');
    } finally {
      setClosingOrderId(null);
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  useEffect(() => {
    if (activeTab === 'open') {
      fetchOpenPositions();
    } else {
      fetchClosedPositions();
    }
  }, [activeTab, refreshTrigger]);

  // ADD THIS: Calculate total PNL for display
  const totalPNL = calculateTotalPNL();
  const isTotalProfit = totalPNL >= 0;

  return (
    <div className="h-64 border-t border-gray-800 flex flex-col">
      {/* Tabs - MODIFIED to show total PNL */}
      <div className="flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab('open')}
            className={`px-4 py-3 text-sm font-semibold ${
              activeTab === 'open'
                ? 'border-b-2 border-blue-500 text-white'
                : 'text-gray-400 hover:bg-gray-800/50'
            }`}
          >
            Open Positions ({openOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('closed')}
            className={`px-4 py-3 text-sm font-semibold ${
              activeTab === 'closed'
                ? 'border-b-2 border-blue-500 text-white'
                : 'text-gray-400 hover:bg-gray-800/50'
            }`}
          >
            Closed Positions ({closedOrders.length})
          </button>
        </div>
        
        {/* ADD THIS: Display total PNL for open positions */}
        {activeTab === 'open' && openOrders.length > 0 && (
          <div className="px-4 py-3 flex items-center gap-2">
            <span className="text-xs text-gray-400">Total P/L:</span>
            <span className={`text-sm font-semibold ${isTotalProfit ? 'text-green-400' : 'text-red-400'}`}>
              {isTotalProfit ? '+' : ''}${totalPNL.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-400">Loading...</span>
          </div>
        ) : activeTab === 'open' ? (
          openOrders.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400">No open positions</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="text-gray-400 bg-gray-900/50">
                <tr className="border-b border-gray-800">
                  <th className="p-3 font-normal">ASSET</th>
                  <th className="p-3 font-normal">TYPE</th>
                  <th className="p-3 font-normal">VOLUME</th>
                  <th className="p-3 font-normal">OPEN PRICE</th>
                  <th className="p-3 font-normal">CURRENT PRICE</th> {/* ADD THIS COLUMN */}
                  <th className="p-3 font-normal">P/L (USD)</th> {/* ADD THIS COLUMN */}
                  <th className="p-3 font-normal">MARGIN</th>
                  <th className="p-3 font-normal">TIME</th>
                  <th className="p-3 font-normal">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {openOrders.map((order) => {
                  // ADD THIS: Calculate PNL for each order
                  const { currentPrice, pnl, pnlPercent, isProfit } = calculateOrderPNL(order);
                  
                  return (
                    <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="p-3 font-semibold text-gray-100">{order.asset}</td>
                      <td className="p-3">
                        <span className={order.type === 'BUY' ? 'text-green-500' : 'text-red-500'}>
                          {order.type}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-gray-100">{order.qty}</td>
                      <td className="p-3 font-mono text-gray-100">${order.boughtPrice.toFixed(2)}</td>
                      {/* ADD THIS CELL: Current Price */}
                      <td className="p-3 font-mono text-white font-semibold">
                        ${currentPrice.toFixed(2)}
                      </td>
                      {/* ADD THIS CELL: P/L */}
                      <td className="p-3 font-mono">
                        <span className={isProfit ? 'text-green-400' : 'text-red-400'}>
                          {isProfit ? '+' : ''}${pnl.toFixed(2)}
                        </span>
                        <span className="text-gray-400 ml-1">
                          ({isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%)
                        </span>
                      </td>
                      <td className="p-3 font-mono text-gray-100">${order.margin.toFixed(2)}</td>
                      <td className="p-3 font-mono text-gray-100">{formatTime(order.createdAt)}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleCloseOrder(order.id)}
                          disabled={closingOrderId === order.id}
                          className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-600 rounded hover:bg-red-600/30 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {closingOrderId === order.id ? 'Closing...' : 'Close'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : (
          // Closed orders table remains the same
          closedOrders.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400">No closed positions</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="text-gray-400 bg-gray-900/50">
                <tr className="border-b border-gray-800">
                  <th className="p-3 font-normal">ASSET</th>
                  <th className="p-3 font-normal">TYPE</th>
                  <th className="p-3 font-normal">VOLUME</th>
                  <th className="p-3 font-normal">OPEN PRICE</th>
                  <th className="p-3 font-normal">CLOSE PRICE</th>
                  <th className="p-3 font-normal">P&L</th>
                  <th className="p-3 font-normal">CLOSED AT</th>
                </tr>
              </thead>
              <tbody>
                {closedOrders.map((order) => {
                  const pnlPercentage = ((order.pnl / order.margin) * 100).toFixed(2);
                  const isProfit = order.pnl >= 0;
                  
                  return (
                    <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="p-3 font-semibold">{order.asset}</td>
                      <td className="p-3">
                        <span className={order.type === 'BUY' ? 'text-green-500' : 'text-red-500'}>
                          {order.type}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{order.qty}</td>
                      <td className="p-3 font-mono">${order.boughtPrice.toFixed(2)}</td>
                      <td className="p-3 font-mono">${order.closedPrice.toFixed(2)}</td>
                      <td className="p-3 font-mono">
                        <span className={isProfit ? 'text-green-500' : 'text-red-500'}>
                          {isProfit ? '+' : ''}{order.pnl.toFixed(2)} USD
                        </span>
                        <span className="text-gray-400 ml-1">
                          ({isProfit ? '+' : ''}{pnlPercentage}%)
                        </span>
                      </td>
                      <td className="p-3 font-mono text-gray-400">{formatDateTime(order.closedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}
