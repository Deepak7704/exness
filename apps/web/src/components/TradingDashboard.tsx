import { useState } from 'react';
import { TradingHeader } from './trading/TradingHeader';
import { InstrumentsSidebar } from './trading/InstrumentsSidebar';
import { TradingChart } from './trading/TradingChart';
import { OrderPanel } from './trading/OrderPanel';
import { PositionsPanel } from './trading/PositionsPanel';
import { useTradingData } from '@/hooks/useTradingData';
import { OrderForm } from '@/types/trading';
import { useToast } from '@/hooks/use-toast';

export const TradingDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { toast } = useToast();
  
  const {
    instruments,
    positions,
    selectedInstrument,
    setSelectedInstrument,
    candlestickData,
    addPosition,
    closePosition,
  } = useTradingData();

  const selectedInstrumentData = instruments.find(i => i.id === selectedInstrument);
  
  // Get active instruments for header tabs
  const activeInstruments = instruments
    .filter(i => i.isFavorite)
    .slice(0, 4)
    .map(i => ({
      id: i.id,
      symbol: i.symbol,
      flag: i.flag,
    }));

  const handlePlaceOrder = (order: OrderForm) => {
    if (!selectedInstrumentData) return;
    
    addPosition(order);
    
    toast({
      title: `${order.type.toUpperCase()} Order Placed`,
      description: `${order.volume} lots of ${selectedInstrumentData.symbol} at ${order.type === 'buy' ? selectedInstrumentData.ask : selectedInstrumentData.bid}`,
    });
  };

  const handleClosePosition = (positionId: string) => {
    closePosition(positionId);
    toast({
      title: "Position Closed",
      description: "Your position has been successfully closed.",
    });
  };

  if (!selectedInstrumentData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <TradingHeader
        activeInstruments={activeInstruments}
        selectedInstrument={selectedInstrument}
        onInstrumentSelect={setSelectedInstrument}
        balance={10040.79}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Instruments Sidebar */}
        <InstrumentsSidebar
          instruments={instruments}
          selectedInstrument={selectedInstrument}
          onInstrumentSelect={setSelectedInstrument}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        
        {/* Chart Area */}
        <TradingChart
          instrumentName={selectedInstrumentData.name}
          instrumentSymbol={selectedInstrumentData.symbol}
          candlestickData={candlestickData}
          currentPrice={selectedInstrumentData.bid}
          change={selectedInstrumentData.change}
          changePercent={selectedInstrumentData.changePercent}
        />
        
        {/* Order Panel */}
        <OrderPanel
          selectedInstrument={selectedInstrumentData}
          onPlaceOrder={handlePlaceOrder}
          sentimentData={{ sellPercentage: 64, buyPercentage: 36 }}
        />
      </div>
      
      {/* Positions Panel */}
      <PositionsPanel
        positions={positions}
        onClosePosition={handleClosePosition}
      />
    </div>
  );
};