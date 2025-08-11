import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useRealtime } from './useDatabase';
import type { Transport } from '@/types/index';

interface DatabaseTransport {
  id: string;
  auftrag_nr: string;
  route_from: string;
  route_to: string;
  status: 'pünktlich' | 'verspätet' | 'kritisch' | 'angekommen';
  eta: string;
  plan_eta: string;
  delay_minutes: number;
  position_lat: number | null;
  position_lng: number | null;
  position_address: string | null;
  cargo: string;
  driver: string;
  progress: number;
  risk_score: number | null;
  created_at: string;
  updated_at: string;
}

function transformDbTransport(dbTransport: DatabaseTransport): Transport {
  return {
    id: dbTransport.id,
    auftragsNr: dbTransport.auftrag_nr,
    route: {
      from: dbTransport.route_from,
      to: dbTransport.route_to,
    },
    status: dbTransport.status,
    eta: new Date(dbTransport.eta).toLocaleString('de-DE'),
    planEta: new Date(dbTransport.plan_eta).toLocaleString('de-DE'),
    delay: dbTransport.delay_minutes,
    position: {
      lat: dbTransport.position_lat || 0,
      lng: dbTransport.position_lng || 0,
      address: dbTransport.position_address || 'Unbekannt',
    },
    cargo: dbTransport.cargo,
    driver: dbTransport.driver,
    progress: dbTransport.progress,
    riskScore: dbTransport.risk_score || 0,
  };
}

export function useRealTransports() {
  const [transports, setTransports] = useState<Transport[]>([]);

  const fetchTransports = useCallback(async () => {
    return supabase
      .from('transports')
      .select('*')
      .order('created_at', { ascending: false });
  }, []);

  const { data, loading, error, refetch } = useQuery<DatabaseTransport[]>(
    fetchTransports,
    [],
    {
      onSuccess: (data) => {
        if (data) {
          setTransports(data.map(transformDbTransport));
        }
      }
    }
  );

  // Real-time updates
  useRealtime('transports', undefined, (payload) => {
    if (payload.eventType === 'INSERT' && payload.new) {
      const newTransport = transformDbTransport(payload.new as DatabaseTransport);
      setTransports(prev => [newTransport, ...prev]);
    } else if (payload.eventType === 'UPDATE' && payload.new) {
      const updatedTransport = transformDbTransport(payload.new as DatabaseTransport);
      setTransports(prev => 
        prev.map(t => t.id === updatedTransport.id ? updatedTransport : t)
      );
    } else if (payload.eventType === 'DELETE' && payload.old) {
      setTransports(prev => prev.filter(t => t.id !== payload.old.id));
    }
  });

  return {
    transports,
    loading,
    error,
    refetch,
  };
}