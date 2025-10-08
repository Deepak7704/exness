"use client"
import { useState, useEffect } from 'react';

interface OrderPanelProps {
  onOrderPlaced?: () => void;
  unrealizedPNL?: number;
  balanceRefreshTrigger?:number;
}

export default function OrderPanel({ onOrderPlaced, unrealizedPNL = 0, balanceRefreshTrigger }: OrderPanelProps) {
  const [selectedAsset, setSelectedAsset] = useState('BTCUSDT');
  const [volume, setVolume] = useState('0.01');
  const [selectedLeverage, setSelectedLeverage] = useState('10x');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [realizedBalance, setRealizedBalance] = useState<number | null>(null);
  const [usedMargin, setUsedMargin] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  const pairs = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];

  useEffect(() => {
    fetchBalance();
  }, []);

  useEffect(()=>{
    if(balanceRefreshTrigger != undefined && balanceRefreshTrigger > 0){
      fetchBalance();
      fetchUsedMargin();
    }
  },[balanceRefreshTrigger])

  const fetchBalance = async () => {
    setIsLoadingBalance(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoadingBalance(false);
        return;
      }

      const response = await fetch('http://localhost:3000/api/user/balance', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRealizedBalance(data.user.balance);
      } else {
        console.error('Failed to fetch balance');
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Fetch used margin from open positions
  const fetchUsedMargin = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/orders/open', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const totalMargin = data.openOrders.reduce((sum: number, order: any) => sum + order.margin, 0);
        setUsedMargin(totalMargin);
      }
    } catch (error) {
      console.error('Failed to fetch used margin:', error);
    }
  };

  useEffect(() => {
    fetchUsedMargin();
  }, []);

  // Refetch used margin when orders change
  useEffect(() => {
    if (onOrderPlaced) {
      fetchUsedMargin();
    }
  }, [unrealizedPNL]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setError('');
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setVolume(value);
    }
  };

  const incrementVolume = () => {
    const current = parseFloat(volume) || 0;
    const step = current < 1 ? 0.01 : 1;
    const newValue = Math.round((current + step) * 100) / 100;
    setVolume(newValue.toString());
  };

  const decrementVolume = () => {
    const current = parseFloat(volume) || 0;
    const step = current <= 1 ? 0.01 : 1;
    const minValue = 0.01;
    if (current > minValue) {
      const newValue = Math.max(minValue, Math.round((current - step) * 100) / 100);
      setVolume(newValue.toString());
    }
  };

  const handleOrder = async (type: 'buy' | 'sell') => {
    setError('');
    
    const qty = parseFloat(volume);
    if (!qty || qty <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login first');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/orders/open', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          asset: selectedAsset,
          qty,
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place the order');
      }

      setVolume('0.01');
      setError('');
      
      // Don't update realized balance - it stays the same
      // Only update used margin
      await fetchUsedMargin();

      alert(`${type.toUpperCase()} order placed successfully!`);
      
      if (onOrderPlaced) {
        onOrderPlaced();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate balances
  const totalBalance = realizedBalance !== null ? realizedBalance + unrealizedPNL : null;
  const freeMargin = realizedBalance !== null ? realizedBalance - usedMargin : null;
  const marginLevel = usedMargin > 0 ? ((realizedBalance || 0) / usedMargin) * 100 : Infinity;

  return (
    <div className="w-full lg:w-72 border-l border-gray-800 bg-[#101421] p-4 flex flex-col min-h-screen lg:min-h-0">
      {/* Balance Header */}
      <div className="mb-4 p-3 bg-gray-900/50 border border-gray-700 rounded-md">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Account Balance</span>
          <button
            onClick={() => {
              fetchBalance();
              fetchUsedMargin();
            }}
            disabled={isLoadingBalance}
            className="text-xs text-blue-500 hover:text-blue-400 disabled:opacity-50"
          >
            {isLoadingBalance ? '⟳' : '↻'}
          </button>
        </div>
        {totalBalance !== null ? (
          <>
            <div className="text-2xl font-bold text-white mb-1">
              ${totalBalance.toFixed(2)}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">Balance: ${realizedBalance?.toFixed(2)}</span>
              {unrealizedPNL !== 0 && (
                <span className={unrealizedPNL >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {unrealizedPNL >= 0 ? '+' : ''}${unrealizedPNL.toFixed(2)}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="text-lg text-gray-400">Loading...</div>
        )}
      </div>

      {/* Asset Selection Buttons */}
      <div className="mb-4">
        <div className="grid grid-cols-3 gap-2">
          {pairs.map((pair) => (
            <button
              key={pair}
              onClick={() => setSelectedAsset(pair)}
              disabled={isLoading}
              className={`py-2 px-1 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
                selectedAsset === pair
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {pair}
            </button>
          ))}
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-4">{selectedAsset}</h3>

      {/* Market/Limit Toggle */}
      <div className="flex border border-gray-700 rounded-md mb-4">
        <button className="flex-1 bg-blue-600 text-white py-2 rounded-l-md text-sm font-semibold">
          Market
        </button>
        <button className="flex-1 py-2 text-gray-400 rounded-r-md text-sm font-semibold hover:bg-gray-800">
          Limit
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-2 bg-red-500/20 border border-red-500 rounded-md text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Volume Input */}
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">VOLUME</label>
          <div className="flex items-center bg-gray-900 border border-gray-700 rounded-md">
            <button
              onClick={decrementVolume}
              disabled={isLoading}
              className="px-3 py-2 text-gray-400 hover:bg-gray-700 active:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <input
              type="text"
              value={volume}
              onChange={handleVolumeChange}
              disabled={isLoading}
              className="w-full bg-transparent text-gray-100 text-center font-mono focus:outline-none py-2 disabled:opacity-50"
              placeholder="0.00"
            />
            <button
              onClick={incrementVolume}
              disabled={isLoading}
              className="px-3 py-2 text-gray-400 hover:bg-gray-700 active:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
            <span className="text-xs text-gray-500 pr-3">Lots</span>
          </div>
        </div>

        {/* Leverage */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">LEVERAGE</label>
          <div className="grid grid-cols-4 gap-1">
            {["1x", "2x", "5x", "10x"].map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLeverage(l)}
                disabled={isLoading}
                className={`py-2 text-sm rounded-md transition-colors ${
                  selectedLeverage === l
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Take Profit & Stop Loss */}
        {["TAKE PROFIT", "STOP LOSS"].map((label) => (
          <div key={label}>
            <label className="text-xs text-gray-400 mb-1 block">{label}</label>
            <div className="flex items-center bg-gray-900 border border-gray-700 rounded-md">
              <span className="px-3 text-gray-500 text-sm">Not set</span>
              <div className="flex-1" />
              <button className="px-3 py-2 text-gray-400 hover:bg-gray-700">
                {label === 'TAKE PROFIT' ? '+' : '-'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Buy/Sell Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <button
          onClick={() => handleOrder('buy')}
          disabled={isLoading || freeMargin === null || freeMargin <= 0}
          className="w-full bg-green-600/20 text-green-400 border border-green-600 py-3 rounded-md hover:bg-green-600/30 transition-colors active:bg-green-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Buy'}
        </button>
        <button
          onClick={() => handleOrder('sell')}
          disabled={isLoading || freeMargin === null || freeMargin <= 0}
          className="w-full bg-red-600/20 text-red-400 border border-red-600 py-3 rounded-md hover:bg-red-600/30 transition-colors active:bg-red-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Sell'}
        </button>
      </div>

      {/* Account Details */}
      <div className="mt-auto border-t border-gray-800 pt-4 text-xs space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Balance</span>
          <span className="font-mono text-white font-semibold">
            {totalBalance !== null ? `$${totalBalance.toFixed(2)}` : 'Loading...'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Realized Balance</span>
          <span className="font-mono text-white">
            {realizedBalance !== null ? `$${realizedBalance.toFixed(2)}` : 'Loading...'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Unrealized P/L</span>
          <span className={`font-mono ${unrealizedPNL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {unrealizedPNL >= 0 ? '+' : ''}${unrealizedPNL.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Free Margin</span>
          <span className="font-mono text-green-400">
            {freeMargin !== null ? `$${freeMargin.toFixed(2)}` : 'Loading...'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Used Margin</span>
          <span className="font-mono text-gray-400">${usedMargin.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Margin Level</span>
          <span className={`font-mono ${marginLevel > 100 ? 'text-green-500' : marginLevel > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
            {marginLevel === Infinity ? '∞' : `${marginLevel.toFixed(2)}%`}
          </span>
        </div>
      </div>
    </div>
  );
}