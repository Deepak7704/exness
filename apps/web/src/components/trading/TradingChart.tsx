import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReactApexChart from 'react-apexcharts';
import { 
  TrendingUp, 
  Save, 
  Camera, 
  Upload,
  Eye,
  Settings,
  BarChart3,
  MoreHorizontal,
  ChevronLeft,
  RefreshCw
} from 'lucide-react';
import { CandlestickData, TimeFrame } from '@/types/trading';
import { cn } from '@/lib/utils';

interface TradingChartProps {
  instrumentName: string;
  instrumentSymbol: string;
  candlestickData: CandlestickData[];
  currentPrice: number;
  change: number;
  changePercent: number;
}

const timeframes: { value: TimeFrame; label: string }[] = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1h' },
  { value: '4h', label: '4h' },
  { value: '1d', label: '1d' },
  { value: '1w', label: '1w' },
];

export const TradingChart = ({
  instrumentName,
  instrumentSymbol,
  candlestickData,
  currentPrice,
  change,
  changePercent
}: TradingChartProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('1m');
  const [isLoading, setIsLoading] = useState(false);

  const isPositive = change >= 0;

  // Format candlestick data for ApexCharts
  const chartData = candlestickData.map(candle => ({
    x: new Date(candle.timestamp),
    y: [candle.open, candle.high, candle.low, candle.close]
  }));

  const chartOptions = {
    chart: {
      type: 'candlestick' as const,
      height: 500,
      background: 'transparent',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: true,
        type: 'xy' as const,
      },
      animations: {
        enabled: true,
        speed: 300,
      },
    },
    theme: {
      mode: 'dark' as const,
    },
    grid: {
      borderColor: 'hsl(var(--chart-grid))',
      strokeDashArray: 1,
    },
    xaxis: {
      type: 'datetime' as const,
      labels: {
        style: {
          colors: 'hsl(var(--foreground-muted))',
          fontSize: '11px',
        },
        datetimeFormatter: {
          year: 'yyyy',
          month: 'MMM',
          day: 'dd',
          hour: 'HH:mm',
          minute: 'HH:mm',
        },
      },
      axisBorder: {
        color: 'hsl(var(--border))',
      },
      axisTicks: {
        color: 'hsl(var(--border))',
      },
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
      labels: {
        style: {
          colors: 'hsl(var(--foreground-muted))',
          fontSize: '11px',
        },
        formatter: (value: number) => value.toFixed(3),
      },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: 'hsl(var(--chart-candle-bull))',
          downward: 'hsl(var(--chart-candle-bear))',
        },
        wick: {
          useFillColor: true,
        },
      },
    },
    tooltip: {
      theme: 'dark',
      style: {
        fontSize: '12px',
        backgroundColor: 'hsl(var(--popover))',
      },
      custom: ({ seriesIndex, dataPointIndex, w }: any) => {
        const data = w.globals.seriesCandleO[seriesIndex][dataPointIndex];
        const o = w.globals.seriesCandleO[seriesIndex][dataPointIndex];
        const h = w.globals.seriesCandleH[seriesIndex][dataPointIndex];
        const l = w.globals.seriesCandleL[seriesIndex][dataPointIndex];
        const c = w.globals.seriesCandleC[seriesIndex][dataPointIndex];
        
        return `
          <div class="px-3 py-2">
            <div class="text-xs text-foreground-muted mb-1">OHLC</div>
            <div class="space-y-1 text-xs">
              <div>O: ${o?.toFixed(3)}</div>
              <div>H: ${h?.toFixed(3)}</div>
              <div>L: ${l?.toFixed(3)}</div>
              <div>C: ${c?.toFixed(3)}</div>
            </div>
          </div>
        `;
      },
    },
  };

  const handleTimeframeChange = (timeframe: TimeFrame) => {
    setSelectedTimeframe(timeframe);
    setIsLoading(true);
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="flex-1 bg-background-elevated border-r border-border flex flex-col">
      {/* Chart Header */}
      <div className="p-4 border-b border-border bg-background-secondary">
        <div className="flex items-center justify-between mb-4">
          {/* Instrument Info */}
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-foreground">
              {instrumentName} • {selectedTimeframe}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-foreground-muted">O</span>
              <span className="text-sm font-mono">
                {candlestickData[candlestickData.length - 1]?.open.toFixed(3)}
              </span>
              <span className="text-sm text-foreground-muted">H</span>
              <span className="text-sm font-mono text-trading-bull">
                {candlestickData[candlestickData.length - 1]?.high.toFixed(3)}
              </span>
              <span className="text-sm text-foreground-muted">L</span>
              <span className="text-sm font-mono text-trading-bear">
                {candlestickData[candlestickData.length - 1]?.low.toFixed(3)}
              </span>
              <span className="text-sm text-foreground-muted">C</span>
              <span className={cn(
                "text-sm font-mono font-semibold",
                isPositive ? "text-trading-bull" : "text-trading-bear"
              )}>
                {candlestickData[candlestickData.length - 1]?.close.toFixed(3)}
              </span>
              <span className={cn(
                "text-sm font-medium",
                isPositive ? "text-trading-bull" : "text-trading-bear"
              )}>
                {isPositive ? '+' : ''}{change.toFixed(3)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          
          {/* Chart Controls */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary">
                Save
              </Badge>
            </Button>
            
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Camera className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Upload className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex items-center space-x-2">
          {timeframes.map((timeframe) => (
            <Button
              key={timeframe.value}
              variant={selectedTimeframe === timeframe.value ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => handleTimeframeChange(timeframe.value)}
              disabled={isLoading}
            >
              {timeframe.label}
            </Button>
          ))}
          
          <div className="ml-4 flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <TrendingUp className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              Indicators
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <BarChart3 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="flex-1 relative bg-background">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        
        <ReactApexChart
          options={chartOptions}
          series={[{ data: chartData }]}
          type="candlestick"
          height="100%"
        />
      </div>
    </div>
  );
};