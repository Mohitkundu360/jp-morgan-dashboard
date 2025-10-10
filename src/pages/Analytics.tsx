import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const performanceMetrics = [
    { period: '1 Month', return: 5.23, trend: 'up' },
    { period: '3 Months', return: 12.45, trend: 'up' },
    { period: 'YTD', return: 18.92, trend: 'up' },
    { period: '1 Year', return: 24.67, trend: 'up' },
  ];

  const topPerformers = [
    { symbol: 'MSFT', name: 'Microsoft', return: 34.5, sector: 'Technology' },
    { symbol: 'AAPL', name: 'Apple', return: 28.3, sector: 'Technology' },
    { symbol: 'GOOGL', name: 'Alphabet', return: 22.1, sector: 'Technology' },
  ];

  const recentActivity = [
    { type: 'buy', symbol: 'AAPL', shares: 50, price: 178.72, date: '2024-01-15', total: 8936 },
    { type: 'sell', symbol: 'TSLA', shares: 25, price: 242.84, date: '2024-01-14', total: 6071 },
    { type: 'buy', symbol: 'MSFT', shares: 30, price: 378.91, date: '2024-01-13', total: 11367 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground">Track your portfolio performance and insights</p>
        </div>

        {/* Performance Overview */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceMetrics.map((metric) => (
              <Card key={metric.period} className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.period}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-success">+{metric.return}%</span>
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Top Performers */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="w-5 h-5 text-primary" />
              Top Performing Stocks
            </CardTitle>
            <CardDescription>Best returns in your portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((stock, index) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{stock.symbol}</h3>
                      <p className="text-sm text-muted-foreground">{stock.name}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {stock.sector}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-success">+{stock.return}%</span>
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Trading Activity</CardTitle>
            <CardDescription>Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className="flex items-center gap-4">
                    <Badge variant={activity.type === 'buy' ? 'default' : 'secondary'}>
                      {activity.type.toUpperCase()}
                    </Badge>
                    <div>
                      <h3 className="font-semibold text-foreground">{activity.symbol}</h3>
                      <p className="text-sm text-muted-foreground">
                        {activity.shares} shares @ ${activity.price}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">${activity.total.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{activity.date}</p>
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

export default Analytics;