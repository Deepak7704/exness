import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  X,
  Briefcase,
  ArrowUpDown,
  Calculator
} from 'lucide-react';
import { Position } from '@/types/trading';
import { cn } from '@/lib/utils';

interface PositionsPanelProps {
  positions: Position[];
  onClosePosition: (positionId: string) => void;
}

export const PositionsPanel = ({ positions, onClosePosition }: PositionsPanelProps) => {
  const [activeTab, setActiveTab] = useState('open');

  const openPositions = positions.filter(pos => true); // All positions are open in this demo
  const pendingPositions: Position[] = [];
  const closedPositions: Position[] = [];

  const formatProfit = (profit: number) => {
    const isPositive = profit >= 0;
    return (
      <span className={cn(
        "font-mono font-semibold",
        isPositive ? "text-trading-bull" : "text-trading-bear"
      )}>
        {isPositive ? '+' : ''}{profit.toFixed(2)}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return price.toFixed(5);
  };

  return (
    <div className="h-64 bg-background-elevated border-t border-border">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border bg-background-secondary">
          <TabsList className="h-8">
            <TabsTrigger value="open" className="text-xs px-4">
              Open ({openPositions.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs px-4">
              Pending ({pendingPositions.length})
            </TabsTrigger>
            <TabsTrigger value="closed" className="text-xs px-4">
              Closed ({closedPositions.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <ArrowUpDown className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Calculator className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <TabsContent value="open" className="h-full m-0">
            {openPositions.length > 0 ? (
              <div className="h-full overflow-y-auto">
                {/* Table Header */}
                <div className="grid grid-cols-8 gap-4 p-4 border-b border-border text-xs font-medium text-foreground-muted bg-background-secondary">
                  <div>Instrument</div>
                  <div>Type</div>
                  <div>Volume</div>
                  <div>Open Price</div>
                  <div>Current Price</div>
                  <div>Profit</div>
                  <div>Time</div>
                  <div>Actions</div>
                </div>
                
                {/* Positions List */}
                <div className="space-y-1 p-2">
                  {openPositions.map((position) => (
                    <div
                      key={position.id}
                      className="grid grid-cols-8 gap-4 p-3 bg-card rounded border border-border hover:bg-card/80 transition-colors"
                    >
                      <div className="font-medium text-sm">{position.instrument}</div>
                      <div>
                        <Badge 
                          variant={position.type === 'buy' ? 'default' : 'destructive'}
                          className={cn(
                            "text-xs",
                            position.type === 'buy' 
                              ? "bg-trading-buy text-white" 
                              : "bg-trading-bear text-white"
                          )}
                        >
                          {position.type.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="font-mono text-sm">{position.volume}</div>
                      <div className="font-mono text-sm">{formatPrice(position.openPrice)}</div>
                      <div className="font-mono text-sm">{formatPrice(position.currentPrice)}</div>
                      <div>{formatProfit(position.profit)}</div>
                      <div className="text-xs text-foreground-muted">
                        {new Date(position.timestamp).toLocaleTimeString()}
                      </div>
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => onClosePosition(position.id)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Briefcase className="h-12 w-12 text-foreground-muted mb-4" />
                <p className="text-foreground-muted text-sm">No open positions</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="h-full m-0">
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Briefcase className="h-12 w-12 text-foreground-muted mb-4" />
              <p className="text-foreground-muted text-sm">No pending orders</p>
            </div>
          </TabsContent>
          
          <TabsContent value="closed" className="h-full m-0">
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Briefcase className="h-12 w-12 text-foreground-muted mb-4" />
              <p className="text-foreground-muted text-sm">No closed positions</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};