import { useState, useEffect } from 'react';
import { MarketOverview } from '@/components/MarketOverview';
import { StockCard } from '@/components/StockCard';
import { StockTable } from '@/components/StockTable';
import { mockStocks } from '@/data/mockStocks';
import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
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

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Market Overview */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Market Overview</h2>
          <MarketOverview />
        </section>

        {/* Stock Listings */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Stock Prices</h2>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="gap-2"
              >
                <Grid className="w-4 h-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="gap-2"
              >
                <List className="w-4 h-4" />
                Table
              </Button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mockStocks.map((stock) => (
                <StockCard key={stock.symbol} stock={stock} />
              ))}
            </div>
          ) : (
            <StockTable stocks={mockStocks} />
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;