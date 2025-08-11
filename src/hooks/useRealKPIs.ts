import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useRealtime } from './useDatabase';

export interface KPI {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  description: string;
  category: string;
}

interface DatabaseKPI {
  id: string;
  metric_name: string;
  value: number;
  unit: string | null;
  change_percent: number | null;
  trend: 'up' | 'down' | 'stable' | null;
  category: string;
  recorded_at: string;
}

function transformDbKPI(dbKPI: DatabaseKPI): KPI {
  const iconMap: Record<string, string> = {
    'transport': 'Truck',
    'financial': 'Euro',
    'efficiency': 'TrendingUp',
    'inventory': 'Package',
    'risk': 'AlertTriangle',
    'default': 'BarChart3'
  };

  return {
    id: dbKPI.id,
    title: dbKPI.metric_name,
    value: dbKPI.unit ? `${dbKPI.value}${dbKPI.unit}` : dbKPI.value.toString(),
    change: dbKPI.change_percent ? `${dbKPI.change_percent > 0 ? '+' : ''}${dbKPI.change_percent}%` : '0%',
    trend: dbKPI.trend || 'stable',
    icon: iconMap[dbKPI.category] || iconMap.default,
    description: `Kategorie: ${dbKPI.category}`,
    category: dbKPI.category,
  };
}

export function useRealKPIs(category?: string) {
  const [kpis, setKpis] = useState<KPI[]>([]);

  const fetchKPIs = useCallback(async () => {
    let query = supabase
      .from('kpis')
      .select('*')
      .order('recorded_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    return query;
  }, [category]);

  const { data, loading, error, refetch } = useQuery<DatabaseKPI[]>(
    fetchKPIs,
    [category],
    {
      onSuccess: (data) => {
        if (data) {
          setKpis(data.map(transformDbKPI));
        }
      }
    }
  );

  // Real-time updates
  useRealtime('kpis', category ? { filter: `category=eq.${category}` } : undefined, (payload) => {
    if (payload.eventType === 'INSERT' && payload.new) {
      const newKPI = transformDbKPI(payload.new as DatabaseKPI);
      setKpis(prev => [newKPI, ...prev]);
    } else if (payload.eventType === 'UPDATE' && payload.new) {
      const updatedKPI = transformDbKPI(payload.new as DatabaseKPI);
      setKpis(prev => 
        prev.map(k => k.id === updatedKPI.id ? updatedKPI : k)
      );
    } else if (payload.eventType === 'DELETE' && payload.old) {
      setKpis(prev => prev.filter(k => k.id !== payload.old.id));
    }
  });

  return {
    kpis,
    loading,
    error,
    refetch,
  };
}