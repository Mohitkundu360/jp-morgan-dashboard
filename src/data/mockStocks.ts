import { Stock } from '@/types/stock';

export const mockStocks: Stock[] = [
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    price: 164.85,
    change: 2.45,
    changePercent: 1.51,
    volume: 12567890,
    marketCap: '475.2B',
    sector: 'Financial Services'
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 189.95,
    change: -1.23,
    changePercent: -0.64,
    volume: 48952341,
    marketCap: '2.98T',
    sector: 'Technology'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.85,
    change: 4.67,
    changePercent: 1.25,
    volume: 22341789,
    marketCap: '2.81T',
    sector: 'Technology'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 138.21,
    change: -0.87,
    changePercent: -0.62,
    volume: 31245678,
    marketCap: '1.75T',
    sector: 'Technology'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 245.67,
    change: 8.94,
    changePercent: 3.78,
    volume: 67234512,
    marketCap: '780.4B',
    sector: 'Automotive'
  },
  {
    symbol: 'BAC',
    name: 'Bank of America Corp.',
    price: 32.47,
    change: 0.23,
    changePercent: 0.71,
    volume: 45123789,
    marketCap: '256.8B',
    sector: 'Financial Services'
  },
  {
    symbol: 'WFC',
    name: 'Wells Fargo & Company',
    price: 42.18,
    change: -0.34,
    changePercent: -0.80,
    volume: 28934567,
    marketCap: '156.2B',
    sector: 'Financial Services'
  },
  {
    symbol: 'GS',
    name: 'Goldman Sachs Group Inc.',
    price: 387.92,
    change: 5.23,
    changePercent: 1.37,
    volume: 1823456,
    marketCap: '132.7B',
    sector: 'Financial Services'
  }
];
