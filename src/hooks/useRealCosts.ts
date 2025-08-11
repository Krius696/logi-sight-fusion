import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useRealtime } from './useDatabase';

export interface CostData {
  month: number;
  transport: number;
  fuel: number;
  personal: number;
  maintenance: number;
  total: number;
}

export interface CostBreakdown {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface DatabaseCostEntry {
  id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
  created_at: string;
}

export function useRealCosts(year: number = new Date().getFullYear()) {
  const [monthlyData, setMonthlyData] = useState<CostData[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);
  const [totalCosts, setTotalCosts] = useState(0);

  const fetchCosts = useCallback(async () => {
    return supabase
      .from('cost_entries')
      .select('*')
      .eq('year', year)
      .order('month', { ascending: true });
  }, [year]);

  const processCostData = useCallback((data: DatabaseCostEntry[]) => {
    // Process monthly data
    const monthlyMap = new Map<number, Partial<CostData>>();
    
    // Initialize all months
    for (let month = 1; month <= 12; month++) {
      monthlyMap.set(month, {
        month,
        transport: 0,
        fuel: 0,
        personal: 0,
        maintenance: 0,
        total: 0
      });
    }

    // Aggregate data by month and category
    data.forEach(entry => {
      const monthData = monthlyMap.get(entry.month) || {};
      const categoryKey = entry.category.toLowerCase() as keyof Omit<CostData, 'month' | 'total'>;
      
      if (categoryKey && ['transport', 'fuel', 'personal', 'maintenance'].includes(categoryKey)) {
        monthData[categoryKey] = (monthData[categoryKey] || 0) + entry.amount;
      }
    });

    // Calculate totals and convert to array
    const processedMonthly = Array.from(monthlyMap.values()).map(monthData => {
      const total = (monthData.transport || 0) + (monthData.fuel || 0) + 
                   (monthData.personal || 0) + (monthData.maintenance || 0);
      return { ...monthData, total } as CostData;
    });

    setMonthlyData(processedMonthly);

    // Calculate current month breakdown
    const currentMonth = new Date().getMonth() + 1;
    const currentMonthData = processedMonthly.find(m => m.month === currentMonth);
    
    if (currentMonthData) {
      const total = currentMonthData.total;
      const breakdown: CostBreakdown[] = [
        {
          name: 'Transport',
          value: currentMonthData.transport,
          color: 'hsl(var(--chart-1))',
          percentage: total > 0 ? (currentMonthData.transport / total) * 100 : 0
        },
        {
          name: 'Kraftstoff',
          value: currentMonthData.fuel,
          color: 'hsl(var(--chart-2))',
          percentage: total > 0 ? (currentMonthData.fuel / total) * 100 : 0
        },
        {
          name: 'Personal',
          value: currentMonthData.personal,
          color: 'hsl(var(--chart-3))',
          percentage: total > 0 ? (currentMonthData.personal / total) * 100 : 0
        },
        {
          name: 'Wartung',
          value: currentMonthData.maintenance,
          color: 'hsl(var(--chart-4))',
          percentage: total > 0 ? (currentMonthData.maintenance / total) * 100 : 0
        }
      ];
      
      setCostBreakdown(breakdown);
      setTotalCosts(total);
    }
  }, []);

  const { data, loading, error, refetch } = useQuery<DatabaseCostEntry[]>(
    fetchCosts,
    [year],
    {
      onSuccess: (data) => {
        if (data) {
          processCostData(data);
        }
      }
    }
  );

  // Real-time updates
  useRealtime('cost_entries', { filter: `year=eq.${year}` }, (payload) => {
    if (data) {
      // Refetch data on any change for simplicity
      refetch();
    }
  });

  return {
    monthlyData,
    costBreakdown,
    totalCosts,
    loading,
    error,
    refetch,
  };
}