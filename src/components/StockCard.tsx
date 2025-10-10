import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Stock } from '@/types/stock';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockCardProps {
  stock: Stock;
}

export const StockCard = ({ stock }: StockCardProps) => {
  const navigate = useNavigate();
  const isPositive = stock.change >= 0;

  return (
    <Card
      className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:bg-card transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/stock/${stock.symbol.toLowerCase()}`)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-2xl text-foreground mb-1">{stock.symbol}</h3>
            <p className="text-sm text-muted-foreground">{stock.name}</p>
          </div>
          <div className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium",
            isPositive
              ? "bg-success text-white"
              : "bg-danger text-white"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </div>
        </div>

        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-3xl font-bold text-foreground">
            ${stock.price.toFixed(2)}
          </span>
          <span className={cn(
            "text-lg font-semibold",
            isPositive ? "text-success" : "text-danger"
          )}>
            {isPositive ? '+' : ''}{stock.change.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-y-4 text-sm mb-4">
          <div>
            <p className="text-muted-foreground mb-1">Volume</p>
            <p className="text-foreground font-medium">
              {stock.volume.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Market Cap</p>
            <p className="text-foreground font-medium">{stock.marketCap}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border/30">
          <p className="text-sm text-muted-foreground">{stock.sector}</p>
        </div>
      </CardHeader>
    </Card>
  );
};
