import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Minus, 
  Plus, 
  Settings,
  X,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { Instrument, OrderForm } from '@/types/trading';
import { cn } from '@/lib/utils';

interface OrderPanelProps {
  selectedInstrument: Instrument;
  onPlaceOrder: (order: OrderForm) => void;
  sentimentData?: {
    sellPercentage: number;
    buyPercentage: number;
  };
}

export const OrderPanel = ({ selectedInstrument, onPlaceOrder, sentimentData }: OrderPanelProps) => {
  const [orderForm, setOrderForm] = useState<OrderForm>({
    instrument: selectedInstrument.id,
    type: 'buy',
    volume: 0.01,
    orderType: 'market',
  });

  const sentiment = sentimentData || { sellPercentage: 64, buyPercentage: 36 };

  const handleVolumeChange = (delta: number) => {
    const newVolume = Math.max(0.01, orderForm.volume + delta);
    setOrderForm(prev => ({ ...prev, volume: Number(newVolume.toFixed(2)) }));
  };

  const handlePlaceOrder = (type: 'buy' | 'sell') => {
    onPlaceOrder({
      ...orderForm,
      type,
      instrument: selectedInstrument.id,
    });
    
    // Reset form
    setOrderForm(prev => ({
      ...prev,
      takeProfit: undefined,
      stopLoss: undefined,
    }));
  };

  return (
    <div className="w-96 bg-background-elevated border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-background-secondary">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs">{selectedInstrument.flag}</span>
            <h3 className="font-semibold text-foreground">{selectedInstrument.symbol}</h3>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <Select value="regular-form" onValueChange={() => {}}>
          <SelectTrigger className="h-8 bg-background-elevated">
            <SelectValue placeholder="Regular form" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="regular-form">Regular form</SelectItem>
            <SelectItem value="advanced-form">Advanced form</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Order Form */}
      <div className="flex-1 p-4 space-y-6">
        {/* Buy/Sell Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            size="lg"
            className="h-16 bg-trading-bear hover:bg-trading-bear/90 text-white font-semibold text-lg"
            onClick={() => handlePlaceOrder('sell')}
          >
            <div className="text-center">
              <div>Sell</div>
              <div className="text-sm font-mono">{selectedInstrument.bid.toFixed(selectedInstrument.symbol.includes('/') ? 5 : 2)}</div>
            </div>
          </Button>
          
          <Button
            size="lg"
            className="h-16 bg-trading-buy hover:bg-trading-buy/90 text-white font-semibold text-lg"
            onClick={() => handlePlaceOrder('buy')}
          >
            <div className="text-center">
              <div>Buy</div>
              <div className="text-sm font-mono">{selectedInstrument.ask.toFixed(selectedInstrument.symbol.includes('/') ? 5 : 2)}</div>
            </div>
          </Button>
        </div>
        
        {/* Sentiment Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-foreground-muted">
            <span>Sell: {sentiment.sellPercentage}%</span>
            <span>Buy: {sentiment.buyPercentage}%</span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden flex">
            <div 
              className="bg-trading-bear"
              style={{ width: `${sentiment.sellPercentage}%` }}
            />
            <div 
              className="bg-trading-buy"
              style={{ width: `${sentiment.buyPercentage}%` }}
            />
          </div>
        </div>
        
        {/* Order Type Toggle */}
        <Tabs 
          value={orderForm.orderType} 
          onValueChange={(value) => setOrderForm(prev => ({ ...prev, orderType: value as 'market' | 'pending' }))}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="market" className="text-xs">Market</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Volume */}
        <div className="space-y-2">
          <Label className="text-xs text-foreground-muted">Volume</Label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleVolumeChange(-0.01)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <Input
                type="number"
                value={orderForm.volume}
                onChange={(e) => setOrderForm(prev => ({ ...prev, volume: Number(e.target.value) }))}
                className="h-8 text-center font-mono"
                step="0.01"
                min="0.01"
              />
              
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleVolumeChange(0.01)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <span className="text-xs text-foreground-muted">Lots</span>
          </div>
        </div>
        
        {/* Take Profit */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-foreground-muted">Take Profit</Label>
            <HelpCircle className="h-3 w-3 text-foreground-muted" />
          </div>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Not set"
              value={orderForm.takeProfit || ''}
              onChange={(e) => setOrderForm(prev => ({ ...prev, takeProfit: Number(e.target.value) || undefined }))}
              className="h-8 flex-1"
              type="number"
            />
            <Select value="price" onValueChange={() => {}}>
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="pips">Pips</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <Minus className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Stop Loss */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-foreground-muted">Stop Loss</Label>
            <HelpCircle className="h-3 w-3 text-foreground-muted" />
          </div>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Not set"
              value={orderForm.stopLoss || ''}
              onChange={(e) => setOrderForm(prev => ({ ...prev, stopLoss: Number(e.target.value) || undefined }))}
              className="h-8 flex-1"
              type="number"
            />
            <Select value="price" onValueChange={() => {}}>
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="pips">Pips</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <Minus className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};