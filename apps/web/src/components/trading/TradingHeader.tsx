import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  User, 
  Bell, 
  Grid3X3, 
  History,
  ChevronDown,
  Plus
} from 'lucide-react';

interface InstrumentTab {
  id: string;
  symbol: string;
  flag?: string;
}

interface TradingHeaderProps {
  activeInstruments: InstrumentTab[];
  selectedInstrument: string;
  onInstrumentSelect: (id: string) => void;
  balance: number;
}

export const TradingHeader = ({ 
  activeInstruments, 
  selectedInstrument, 
  onInstrumentSelect, 
  balance 
}: TradingHeaderProps) => {
  return (
    <header className="bg-background-secondary border-b border-border h-14 flex items-center justify-between px-4 sticky top-0 z-50">
      {/* Left Section - Logo and Instrument Tabs */}
      <div className="flex items-center space-x-6">
        {/* Exness Logo */}
        <div className="text-primary font-bold text-xl tracking-tight">
          exness
        </div>
        
        {/* Instrument Tabs */}
        <div className="flex items-center space-x-1">
          {activeInstruments.map((instrument) => (
            <Button
              key={instrument.id}
              variant={selectedInstrument === instrument.id ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-3 text-sm font-medium"
              onClick={() => onInstrumentSelect(instrument.id)}
            >
              <span className="mr-1 text-xs">{instrument.flag}</span>
              {instrument.symbol}
            </Button>
          ))}
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Right Section - Account Info and Controls */}
      <div className="flex items-center space-x-4">
        {/* Account Type and Balance */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-trading-bull/10 text-trading-bull border-trading-bull">
              Demo
            </Badge>
            <Badge variant="outline" className="text-foreground-muted">
              Standard
            </Badge>
          </div>
          
          <div className="flex items-center text-sm">
            <span className="font-semibold text-foreground">
              {balance.toLocaleString('en-US', { 
                style: 'currency', 
                currency: 'USD',
                minimumFractionDigits: 2 
              })}
            </span>
            <ChevronDown className="ml-1 h-3 w-3 text-foreground-muted" />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <History className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Grid3X3 className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <User className="h-4 w-4" />
          </Button>
          
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 text-sm font-medium">
            Deposit
          </Button>
        </div>
      </div>
    </header>
  );
};