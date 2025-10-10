import { useNavigate } from 'react-router-dom';
import { Stock } from '@/types/stock';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StockTableProps {
  stocks: Stock[];
}

export const StockTable = ({ stocks }: StockTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-muted-foreground font-semibold">Symbol</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Name</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-right">Price</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-right">Change</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-right">Volume</TableHead>
            <TableHead className="text-muted-foreground font-semibold text-right">Market Cap</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Sector</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks.map((stock) => {
            const isPositive = stock.change >= 0;
            return (
              <TableRow
                key={stock.symbol}
                className="border-border/50 hover:bg-primary/5 cursor-pointer transition-colors"
                onClick={() => navigate(`/stock/${stock.symbol.toLowerCase()}`)}
              >
                <TableCell className="font-semibold text-foreground">{stock.symbol}</TableCell>
                <TableCell className="text-muted-foreground">{stock.name}</TableCell>
                <TableCell className="text-right font-semibold text-foreground">
                  ${stock.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 text-success" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-danger" />
                    )}
                    <span className={cn(
                      "font-medium",
                      isPositive ? "text-success" : "text-danger"
                    )}>
                      {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {(stock.volume / 1000000).toFixed(2)}M
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {stock.marketCap}
                </TableCell>
                <TableCell className="text-muted-foreground">{stock.sector}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
