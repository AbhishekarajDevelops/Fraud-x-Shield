-- Create users table that extends auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  amount DECIMAL NOT NULL,
  merchant TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  location TEXT,
  card_type TEXT,
  card_last_four TEXT,
  category TEXT,
  is_fraudulent BOOLEAN DEFAULT false,
  risk_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create ML model stats table
CREATE TABLE IF NOT EXISTS public.ml_model_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  accuracy DECIMAL,
  precision DECIMAL,
  recall DECIMAL,
  f1_score DECIMAL,
  last_trained TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_samples INTEGER,
  fraud_samples INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_model_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions"
ON public.transactions
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
CREATE POLICY "Users can insert their own transactions"
ON public.transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view ML model stats" ON public.ml_model_stats;
CREATE POLICY "Anyone can view ML model stats"
ON public.ml_model_stats
FOR SELECT
USING (true);

-- Enable realtime
alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.transactions;
