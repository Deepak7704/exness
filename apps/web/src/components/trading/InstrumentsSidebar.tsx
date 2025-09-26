import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Star, 
  Menu,
  MoreVertical,
  X,
  ChevronDown,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Instrument } from '@/types/trading';
import { cn } from '@/lib/utils';

interface InstrumentsSidebarProps {
  instruments: Instrument[];
  selectedInstrument: string;
  onInstrumentSelect: (id: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const InstrumentsSidebar = ({ 
  instruments, 
  selectedInstrument, 
  onInstrumentSelect,
  isCollapsed = false,
  onToggleCollapse
}: InstrumentsSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(true);

  const filteredInstruments = instruments.filter(instrument =>
    instrument.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    instrument.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteInstruments = filteredInstruments.filter(i => i.isFavorite);
  const otherInstruments = filteredInstruments.filter(i => !i.isFavorite);

  const formatPrice = (price: number, symbol: string) => {
    const decimals = symbol.includes('/') ? 5 : 2;
    return price.toFixed(decimals);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={onToggleCollapse}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-sidebar-foreground tracking-wide">
            INSTRUMENTS
          </h2>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreVertical className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onToggleCollapse}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-8 bg-background-elevated border-border"
          />
        </div>
      </div>
      
      {/* Favorites Section */}
      <div className="flex-1 overflow-y-auto">
        {favoriteInstruments.length > 0 && (
          <div className="p-4 border-b border-sidebar-border">
            <div 
              className="flex items-center justify-between mb-3 cursor-pointer"
              onClick={() => setShowFavorites(!showFavorites)}
            >
              <h3 className="text-xs font-medium text-foreground-muted">Favorites</h3>
              <ChevronDown className={cn(
                "h-3 w-3 text-foreground-muted transition-transform",
                !showFavorites && "rotate-180"
              )} />
            </div>
            
            {showFavorites && (
              <div className="space-y-1">
                {favoriteInstruments.map((instrument) => (
                  <InstrumentRow
                    key={instrument.id}
                    instrument={instrument}
                    isSelected={selectedInstrument === instrument.id}
                    onSelect={onInstrumentSelect}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Instruments List */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3 text-xs font-medium text-foreground-muted">
            <span>Symbol</span>
            <div className="flex space-x-6">
              <span>Bid</span>
              <span>Ask</span>
            </div>
          </div>
          
          <div className="space-y-1">
            {otherInstruments.map((instrument) => (
              <InstrumentRow
                key={instrument.id}
                instrument={instrument}
                isSelected={selectedInstrument === instrument.id}
                onSelect={onInstrumentSelect}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface InstrumentRowProps {
  instrument: Instrument;
  isSelected: boolean;
  onSelect: (id: string) => void;
  formatPrice: (price: number, symbol: string) => string;
}

const InstrumentRow = ({ instrument, isSelected, onSelect, formatPrice }: InstrumentRowProps) => {
  const isPositive = instrument.changePercent >= 0;
  
  return (
    <div
      className={cn(
        "flex items-center justify-between p-2 rounded cursor-pointer transition-colors hover:bg-sidebar-accent group",
        isSelected && "bg-sidebar-accent"
      )}
      onClick={() => onSelect(instrument.id)}
    >
      <div className="flex items-center space-x-3 flex-1">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="text-xs">{instrument.flag}</span>
          <div className="min-w-0">
            <div className="font-medium text-sm text-sidebar-foreground">
              {instrument.symbol}
            </div>
            {instrument.changePercent !== 0 && (
              <div className="flex items-center space-x-1">
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 text-trading-bull" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-trading-bear" />
                )}
                <span className={cn(
                  "text-xs font-medium",
                  isPositive ? "text-trading-bull" : "text-trading-bear"
                )}>
                  {isPositive ? '+' : ''}{instrument.changePercent.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </div>
        
        {instrument.isFavorite && (
          <Star className="h-3 w-3 text-primary fill-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      
      <div className="flex space-x-4 text-xs">
        <div className={cn(
          "text-right min-w-[60px] px-2 py-1 rounded",
          isPositive ? "bg-trading-bull/10 text-trading-bull" : "bg-trading-bear/10 text-trading-bear"
        )}>
          {formatPrice(instrument.bid, instrument.symbol)}
        </div>
        <div className={cn(
          "text-right min-w-[60px] px-2 py-1 rounded",
          isPositive ? "bg-trading-bull/10 text-trading-bull" : "bg-trading-bear/10 text-trading-bear"
        )}>
          {formatPrice(instrument.ask, instrument.symbol)}
        </div>
      </div>
    </div>
  );
};