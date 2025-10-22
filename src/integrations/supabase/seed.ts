import 'dotenv/config'; // automatically loads .env
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL or SUPABASE_SERVICE_KEY is not defined in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

  if (error) console.error('Seed error:', error);
  else console.log('Seed complete:', data);
}

seed();
