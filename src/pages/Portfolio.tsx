import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Holding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  average_price: number;
  sector: string | null;
}

const Portfolio = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchHoldings();
    }
  }, [user]);

  const fetchHoldings = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHoldings(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch portfolio holdings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const mockHoldings = [
    { symbol: 'AAPL', name: 'Apple Inc.', shares: 150, currentPrice: 178.72, average_price: 165.50, currentValue: 26808, gainLoss: 1983, gainLossPercent: 7.98, sector: 'Technology', id: '1' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 100, currentPrice: 378.91, average_price: 340.20, currentValue: 37891, gainLoss: 3871, gainLossPercent: 11.38, sector: 'Technology', id: '2' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 75, currentPrice: 141.80, average_price: 130.50, currentValue: 10635, gainLoss: 847.50, gainLossPercent: 8.66, sector: 'Technology', id: '3' },
    { symbol: 'JPM', name: 'JPMorgan Chase', shares: 200, currentPrice: 148.27, average_price: 142.30, currentValue: 29654, gainLoss: 1194, gainLossPercent: 4.20, sector: 'Financial', id: '4' },
  ];

  const displayHoldings = holdings.length > 0 ? holdings.map(h => ({
    ...h,
    currentPrice: h.average_price * 1.05,
    currentValue: h.shares * h.average_price * 1.05,
    gainLoss: h.shares * h.average_price * 0.05,
    gainLossPercent: 5
  })) : mockHoldings;

  const totalValue = displayHoldings.reduce((sum, holding) => sum + holding.currentValue, 0);
  const totalGainLoss = displayHoldings.reduce((sum, holding) => sum + holding.gainLoss, 0);
  const totalGainLossPercent = (totalGainLoss / (totalValue - totalGainLoss)) * 100;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Portfolio</h1>
          <p className="text-muted-foreground">Track and manage your investments</p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">${totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Portfolio value</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                Total Gain/Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                ${Math.abs(totalGainLoss).toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={totalGainLoss >= 0 ? 'default' : 'destructive'} className="text-xs">
                  {totalGainLoss >= 0 ? '+' : '-'}{totalGainLossPercent.toFixed(2)}%
                </Badge>
                <span className="text-xs text-muted-foreground">All time</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <PieChart className="w-4 h-4" />
                Diversity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{displayHoldings.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Holdings</p>
            </CardContent>
          </Card>
        </div>

        {/* Holdings List */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Holdings</CardTitle>
            <CardDescription>Your current investment positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayHoldings.map((holding) => (
                <div
                  key={holding.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{holding.symbol}</h3>
                        <p className="text-sm text-muted-foreground">{holding.name}</p>
                      </div>
                      {holding.sector && (
                        <Badge variant="outline" className="text-xs">
                          {holding.sector}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-8 text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">Shares</p>
                      <p className="font-medium text-foreground">{holding.shares}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Price</p>
                      <p className="font-medium text-foreground">${holding.average_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Current Value</p>
                      <p className="font-medium text-foreground">${holding.currentValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gain/Loss</p>
                      <div className="flex flex-col items-end gap-1">
                        <p className={`font-medium ${holding.gainLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                          ${Math.abs(holding.gainLoss).toLocaleString()}
                        </p>
                        <Badge
                          variant={holding.gainLoss >= 0 ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {holding.gainLoss >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {holding.gainLossPercent.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Portfolio;