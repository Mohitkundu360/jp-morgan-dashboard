import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, ArrowLeft, ShoppingCart, History } from 'lucide-react';
import { mockStocks } from '@/data/mockStocks';
import { cn } from '@/lib/utils';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

// Input validation schema
const tradeSchema = z.object({
  shares: z.number()
    .positive({ message: "Shares must be positive" })
    .int({ message: "Shares must be a whole number" })
    .max(1000000, { message: "Maximum 1,000,000 shares per transaction" })
});

const StockDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [shares, setShares] = useState<number>(0);
  const [currentHolding, setCurrentHolding] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const stock = mockStocks.find(s => s.symbol.toLowerCase() === symbol?.toLowerCase());

  useEffect(() => {
    if (!user || !stock) return;

    const fetchData = async () => {
      setLoading(true);

      // Fetch current holding
      const { data: holdingData } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', user.id)
        .eq('symbol', stock.symbol)
        .maybeSingle();

      setCurrentHolding(holdingData);

      // Fetch transaction history
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('symbol', stock.symbol)
        .order('created_at', { ascending: false })
        .limit(10);

      setTransactions(transactionsData || []);
      setLoading(false);
    };

    fetchData();
  }, [user, stock]);

  if (!stock) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Stock Not Found</h1>
          <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const isPositive = stock.change >= 0;

  // Generate mock price history data
  const generatePriceHistory = () => {
    const data = [];
    const basePrice = stock.price;
    const volatility = 0.02;

    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const randomChange = (Math.random() - 0.5) * volatility * basePrice;
      const price = basePrice + randomChange - (i * stock.change / 30);

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: Number(price.toFixed(2)),
        volume: Math.floor(stock.volume * (0.8 + Math.random() * 0.4))
      });
    }
    return data;
  };

  const priceHistory = generatePriceHistory();

  const estimatedCost = shares * stock.price;

  const handleBuy = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make trades",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // Validate input
    try {
      tradeSchema.parse({ shares });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid Input",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      // Insert transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          symbol: stock.symbol,
          type: 'buy',
          shares: shares,
          price: stock.price,
          total: estimatedCost
        });

      if (transactionError) throw transactionError;

      // Update or create holding
      if (currentHolding) {
        const newShares = Number(currentHolding.shares) + shares;
        const newAveragePrice = ((Number(currentHolding.shares) * Number(currentHolding.average_price)) + estimatedCost) / newShares;

        const { error: updateError } = await supabase
          .from('portfolio_holdings')
          .update({
            shares: newShares,
            average_price: newAveragePrice
          })
          .eq('id', currentHolding.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('portfolio_holdings')
          .insert({
            user_id: user.id,
            symbol: stock.symbol,
            name: stock.name,
            sector: stock.sector,
            shares: shares,
            average_price: stock.price
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Buy Order Executed",
        description: `Successfully bought ${shares} shares of ${stock.symbol} for $${estimatedCost.toFixed(2)}`,
      });

      setShares(0);

      // Refresh data
      const { data: holdingData } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', user.id)
        .eq('symbol', stock.symbol)
        .maybeSingle();

      setCurrentHolding(holdingData);

      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('symbol', stock.symbol)
        .order('created_at', { ascending: false })
        .limit(10);

      setTransactions(transactionsData || []);

    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to execute buy order",
        variant: "destructive",
      });
    }
  };

  const handleSell = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make trades",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // Validate input
    try {
      tradeSchema.parse({ shares });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid Input",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    if (!currentHolding || Number(currentHolding.shares) < shares) {
      toast({
        title: "Insufficient Shares",
        description: `You only own ${currentHolding?.shares || 0} shares of ${stock.symbol}`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Insert transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          symbol: stock.symbol,
          type: 'sell',
          shares: shares,
          price: stock.price,
          total: estimatedCost
        });

      if (transactionError) throw transactionError;

      const newShares = Number(currentHolding.shares) - shares;

      if (newShares === 0) {
        // Delete holding if all shares sold
        const { error: deleteError } = await supabase
          .from('portfolio_holdings')
          .delete()
          .eq('id', currentHolding.id);

        if (deleteError) throw deleteError;
      } else {
        // Update holding
        const { error: updateError } = await supabase
          .from('portfolio_holdings')
          .update({ shares: newShares })
          .eq('id', currentHolding.id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Sell Order Executed",
        description: `Successfully sold ${shares} shares of ${stock.symbol} for $${estimatedCost.toFixed(2)}`,
      });

      setShares(0);

      // Refresh data
      const { data: holdingData } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', user.id)
        .eq('symbol', stock.symbol)
        .maybeSingle();

      setCurrentHolding(holdingData);

      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('symbol', stock.symbol)
        .order('created_at', { ascending: false })
        .limit(10);

      setTransactions(transactionsData || []);

    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to execute sell order",
        variant: "destructive",
      });
    }
  };

  const chartConfig = {
    price: {
      label: "Price",
      color: isPositive ? "hsl(var(--success))" : "hsl(var(--danger))",
    },
    volume: {
      label: "Volume",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            className="border-border/50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{stock.symbol}</h1>
            <p className="text-muted-foreground">{stock.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Price Card */}
          <Card className="lg:col-span-2 border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Price Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-bold text-foreground">
                  ${stock.price.toFixed(2)}
                </span>
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1 rounded-full",
                  isPositive ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                )}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-semibold">
                    {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-background/30 border border-border/30">
                  <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
                  <p className="text-xl font-semibold text-foreground">{stock.marketCap}</p>
                </div>
                <div className="p-4 rounded-lg bg-background/30 border border-border/30">
                  <p className="text-sm text-muted-foreground mb-1">Volume</p>
                  <p className={cn(
                    "text-xl font-semibold",
                    stock.volume > 50000000 ? "text-success" : "text-foreground"
                  )}>
                    {(stock.volume / 1000000).toFixed(2)}M
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/30 border border-border/30">
                  <p className="text-sm text-muted-foreground mb-1">Sector</p>
                  <p className="text-xl font-semibold text-foreground">{stock.sector}</p>
                </div>
                <div className="p-4 rounded-lg bg-background/30 border border-border/30">
                  <p className="text-sm text-muted-foreground mb-1">52 Week Range</p>
                  <p className="text-xl font-semibold text-foreground">
                    ${(stock.price * 0.85).toFixed(2)} - ${(stock.price * 1.15).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Price Chart */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">30-Day Price Trend</h3>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceHistory}>
                      <devs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--danger))"}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--danger))"}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </devs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--danger))"}
                        strokeWidth={2}
                        fill="url(#priceGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Trade Card */}
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Trade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentHolding && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <p className="text-sm text-muted-foreground mb-1">Current Position</p>
                  <p className="text-lg font-bold text-foreground">
                    {Number(currentHolding.shares).toFixed(2)} shares
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Avg. Price: ${Number(currentHolding.average_price).toFixed(2)}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Shares</label>
                <input
                  type="number"
                  placeholder="0"
                  value={shares || ''}
                  onChange={(e) => setShares(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border/50 text-foreground focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div className="p-3 rounded-lg bg-background/30 border border-border/30">
                <p className="text-sm text-muted-foreground mb-1">Estimated Cost</p>
                <p className="text-2xl font-bold text-primary">${estimatedCost.toFixed(2)}</p>
              </div>
              <div className="space-y-2">
                <Button onClick={handleBuy} className="w-full bg-success hover:bg-success/90">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Buy
                </Button>
                <Button onClick={handleSell} variant="outline" className="w-full border-danger text-danger hover:bg-danger/10">
                  Sell
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="lg:col-span-3 border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <History className="w-5 h-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!user ? (
                <p className="text-muted-foreground text-center py-8">
                  Please sign in to view your transaction history
                </p>
              ) : loading ? (
                <p className="text-muted-foreground text-center py-8">Loading...</p>
              ) : transactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No transactions yet. Start trading to see your history here.
                </p>
              ) : (
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border/30 hover:bg-background/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold",
                          transaction.type === 'buy'
                            ? "bg-success/20 text-success"
                            : "bg-danger/20 text-danger"
                        )}>
                          {transaction.type.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {Number(transaction.shares).toFixed(2)} shares
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${Number(transaction.price).toFixed(2)} per share
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ${Number(transaction.total).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card className="lg:col-span-3 border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {stock.symbol === 'JPM' && "JPMorgan Chase & Co. is a leading global financial services firm with assets of $3.7 trillion and operations worldwide. The firm is a leader in investment banking, financial services for consumers and small businesses, commercial banking, financial transaction processing, and asset management."}
                {stock.symbol === 'AAPL' && "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and Wearables, Home and Accessories."}
                {stock.symbol === 'MSFT' && "Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. The company operates in Productivity and Business Processes, Intelligent Cloud, and More Personal Computing segments."}
                {stock.symbol === 'GOOGL' && "Alphabet Inc. offers various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. It operates through Google Services, Google Cloud, and Other Bets segments."}
                {stock.symbol === 'TSLA' && "Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally."}
                {!['JPM', 'AAPL', 'MSFT', 'GOOGL', 'TSLA'].includes(stock.symbol) && `${stock.name} is a leading company in the ${stock.sector} sector, providing innovative solutions and services to customers worldwide.`}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StockDetail;
