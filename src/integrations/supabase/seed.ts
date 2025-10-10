import 'dotenv/config'; // automatically loads .env

import { createClient } from '@supabase/supabase-js';

// Read from .env
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL or SUPABASE_KEY is not defined in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Example seeding
async function seed() {
  const { data, error } = await supabase.from('portfolio_holdings').insert([
    {
      id: '1',
      name: 'Apple',
      symbol: 'AAPL',
      shares: 10,
      average_price: 150,
      user_id: 'your-user-id',
    },
  ]);

  if (error) console.error(error);
  else console.log('Seed complete:', data);
}

seed();
