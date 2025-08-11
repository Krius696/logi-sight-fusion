-- Create core logistics database schema

-- Transports table
CREATE TABLE public.transports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auftrag_nr TEXT NOT NULL UNIQUE,
  route_from TEXT NOT NULL,
  route_to TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pünktlich', 'verspätet', 'kritisch', 'angekommen')),
  eta TIMESTAMP WITH TIME ZONE NOT NULL,
  plan_eta TIMESTAMP WITH TIME ZONE NOT NULL,
  delay_minutes INTEGER DEFAULT 0,
  position_lat DECIMAL(10, 8),
  position_lng DECIMAL(11, 8),
  position_address TEXT,
  cargo TEXT NOT NULL,
  driver TEXT NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- KPIs table for dashboard metrics
CREATE TABLE public.kpis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  value DECIMAL(12, 2) NOT NULL,
  unit TEXT,
  change_percent DECIMAL(5, 2),
  trend TEXT CHECK (trend IN ('up', 'down', 'stable')),
  category TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cost analysis data
CREATE TABLE public.cost_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inventory items
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  max_stock INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'Stück',
  location TEXT,
  supplier TEXT,
  status TEXT NOT NULL CHECK (status IN ('normal', 'niedrig', 'kritisch', 'überbestand')),
  last_delivery DATE,
  next_delivery DATE,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI recommendations
CREATE TABLE public.ai_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  category TEXT NOT NULL,
  impact TEXT NOT NULL,
  timeline TEXT NOT NULL,
  savings_potential DECIMAL(12, 2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  category TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_entity_type TEXT,
  related_entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.transports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create policies (public access for now, can be restricted later with auth)
CREATE POLICY "Enable read access for all users" ON public.transports FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.transports FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.transports FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.transports FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.kpis FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.kpis FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.kpis FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.kpis FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.cost_entries FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.cost_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.cost_entries FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.cost_entries FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.inventory_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.inventory_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.inventory_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.inventory_items FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.ai_recommendations FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.ai_recommendations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.ai_recommendations FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.ai_recommendations FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.alerts FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.alerts FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_transports_updated_at
  BEFORE UPDATE ON public.transports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_recommendations_updated_at
  BEFORE UPDATE ON public.ai_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER TABLE public.transports REPLICA IDENTITY FULL;
ALTER TABLE public.kpis REPLICA IDENTITY FULL;
ALTER TABLE public.cost_entries REPLICA IDENTITY FULL;
ALTER TABLE public.inventory_items REPLICA IDENTITY FULL;
ALTER TABLE public.ai_recommendations REPLICA IDENTITY FULL;
ALTER TABLE public.alerts REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.transports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kpis;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cost_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_recommendations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;