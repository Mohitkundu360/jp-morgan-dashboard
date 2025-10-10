import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MarketOverview = () => {
  const marketData = [
    {
      title: 'Total Portfolio Value',
      value: '$2,847,392.45',
      change: '+2.34%',
      isPositive: true,
      icon: DollarSign
    },
    {
      title: 'Day\'s Change',
      value: '$67,234.12',
      change: '+1.89%',
      isPositive: true,
      icon: TrendingUp
    },
    {
      title: 'Active Positions',
      value: '247',
      change: '+5',
      isPositive: true,
      icon: BarChart3
    },
    {
      title: 'Market Index',
      value: '4,421.85',
      change: '-0.12%',
      isPositive: false,
      icon: TrendingDown
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {marketData.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="text-3xl font-bold text-foreground mb-2">{item.value}</div>
              <div className={cn(
                "text-sm font-semibold flex items-center gap-1",
                item.isPositive ? 'text-success' : 'text-danger'
              )}>
                {item.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {item.change}
              </div>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
};
