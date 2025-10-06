"use client"
import { useState, useEffect } from 'react';

interface OpenOrder {
  id: string;
  asset: string;
  type: 'BUY' | 'SELL'; // ✅ Updated to match enum values
  boughtPrice: number;
  qty: number;
  margin: number;
  createdAt: string;
}

interface ClosedOrder {
  id: string;
  asset: string;
  type: 'BUY' | 'SELL'; // ✅ Updated to match enum values
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
}

export function PositionsPanel({ refreshTrigger }: PositionsPanelProps) {
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);
  const [closedOrders, setClosedOrders] = useState<ClosedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [closingOrderId, setClosingOrderId] = useState<string | null>(null);

  // Fetch open positions
  const fetchOpenPositions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      // ✅ Added Authorization header
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

      // ✅ Added Authorization header
      const response = await fetch('http://localhost:3000/api/orders/closed', {
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

      // ✅ Added Authorization header
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
      fetchOpenPositions(); // ✅ Refresh the list
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

  // ✅ Fetch data on mount, tab changes, AND when refreshTrigger changes
  useEffect(() => {
    if (activeTab === 'open') {
      fetchOpenPositions();
    } else {
      fetchClosedPositions();
    }
  }, [activeTab, refreshTrigger]);

  return (
    <div className="h-64 border-t border-gray-800 flex flex-col">
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-800">
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
                  <th className="p-3 font-normal">MARGIN</th>
                  <th className="p-3 font-normal">TIME</th>
                  <th className="p-3 font-normal">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {openOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="p-3 font-semibold text-gray-100">{order.asset}</td>
                    <td className="p-3">
                      <span className={order.type === 'BUY' ? 'text-green-500' : 'text-red-500'}>
                        {order.type}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-gray-100">{order.qty}</td>
                    <td className="p-3 font-mono text-gray-100">${order.boughtPrice.toFixed(2)}</td>
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
                ))}
              </tbody>
            </table>
          )
        ) : (
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
