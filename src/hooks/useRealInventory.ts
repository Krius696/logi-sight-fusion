import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useRealtime } from './useDatabase';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  location?: string;
  supplier?: string;
  status: 'normal' | 'niedrig' | 'kritisch' | 'überbestand';
  lastDelivery?: string;
  nextDelivery?: string;
  category: string;
}

interface DatabaseInventoryItem {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  location: string | null;
  supplier: string | null;
  status: 'normal' | 'niedrig' | 'kritisch' | 'überbestand';
  last_delivery: string | null;
  next_delivery: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

function transformDbInventoryItem(dbItem: DatabaseInventoryItem): InventoryItem {
  return {
    id: dbItem.id,
    name: dbItem.name,
    sku: dbItem.sku,
    currentStock: dbItem.current_stock,
    minStock: dbItem.min_stock,
    maxStock: dbItem.max_stock,
    unit: dbItem.unit,
    location: dbItem.location || undefined,
    supplier: dbItem.supplier || undefined,
    status: dbItem.status,
    lastDelivery: dbItem.last_delivery || undefined,
    nextDelivery: dbItem.next_delivery || undefined,
    category: dbItem.category,
  };
}

export function useRealInventory(category?: string) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [criticalItems, setCriticalItems] = useState<InventoryItem[]>([]);

  const fetchInventory = useCallback(async () => {
    let query = supabase
      .from('inventory_items')
      .select('*')
      .order('name', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    return query;
  }, [category]);

  const { data, loading, error, refetch } = useQuery<DatabaseInventoryItem[]>(
    fetchInventory,
    [category],
    {
      onSuccess: (data) => {
        if (data) {
          const transformedItems = data.map(transformDbInventoryItem);
          setItems(transformedItems);
          
          // Filter critical items (low stock or overstock)
          const critical = transformedItems.filter(
            item => item.status === 'kritisch' || item.status === 'niedrig' || item.status === 'überbestand'
          );
          setCriticalItems(critical);
        }
      }
    }
  );

  // Real-time updates
  useRealtime('inventory_items', category ? { filter: `category=eq.${category}` } : undefined, (payload) => {
    if (payload.eventType === 'INSERT' && payload.new) {
      const newItem = transformDbInventoryItem(payload.new as DatabaseInventoryItem);
      setItems(prev => [...prev, newItem].sort((a, b) => a.name.localeCompare(b.name)));
      
      if (['kritisch', 'niedrig', 'überbestand'].includes(newItem.status)) {
        setCriticalItems(prev => [...prev, newItem]);
      }
    } else if (payload.eventType === 'UPDATE' && payload.new) {
      const updatedItem = transformDbInventoryItem(payload.new as DatabaseInventoryItem);
      setItems(prev => 
        prev.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
      
      // Update critical items
      setCriticalItems(prev => {
        const filtered = prev.filter(item => item.id !== updatedItem.id);
        if (['kritisch', 'niedrig', 'überbestand'].includes(updatedItem.status)) {
          return [...filtered, updatedItem];
        }
        return filtered;
      });
    } else if (payload.eventType === 'DELETE' && payload.old) {
      setItems(prev => prev.filter(item => item.id !== payload.old.id));
      setCriticalItems(prev => prev.filter(item => item.id !== payload.old.id));
    }
  });

  return {
    items,
    criticalItems,
    loading,
    error,
    refetch,
  };
}