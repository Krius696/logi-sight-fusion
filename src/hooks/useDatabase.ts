import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UseQueryOptions<T> {
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useQuery<T>(
  queryFn: () => Promise<any>,
  dependencies: any[] = [],
  options: UseQueryOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const { enabled = true, onSuccess, onError } = options;

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await queryFn();
        
        if (result.error) {
          throw new Error(result.error.message || 'Database query failed');
        }
        
        setData(result.data);
        if (result.data) {
          onSuccess?.(result.data);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
        
        toast({
          title: "Fehler beim Laden der Daten",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [enabled, ...dependencies]);

  const refetch = () => {
    if (enabled) {
      setLoading(true);
      setError(null);
    }
  };

  return { data, loading, error, refetch };
}

export function useMutation<T, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<any>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const { onSuccess, onError } = options;

  const mutate = async (variables: TVariables) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await mutationFn(variables);
      
      if (result.error) {
        throw new Error(result.error.message || 'Database mutation failed');
      }
      
      if (result.data) {
        onSuccess?.(result.data);
      }
      return result.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      
      toast({
        title: "Fehler bei der Operation",
        description: error.message,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

export function useRealtime<T>(
  table: string,
  filter?: Record<string, any>,
  onUpdate?: (payload: any) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          ...filter,
        },
        (payload) => {
          onUpdate?.(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, JSON.stringify(filter)]);
}