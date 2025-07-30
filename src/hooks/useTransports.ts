import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Transport, TransportUpdate } from '@/types';

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'ws://localhost:4000/graphql';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:4000/ws';

// Mock data fallback
const mockTransports: Transport[] = [
  {
    id: 'T-001',
    auftragsNr: 'SO-8832',
    route: { from: 'München', to: 'Hamburg' },
    status: 'verspätet',
    eta: '14:45',
    planEta: '14:00',
    delay: 45,
    position: { lat: 52.3, lng: 9.8, address: 'A7 bei Hannover' },
    cargo: 'Elektronikteile (2.4t)',
    driver: 'M. Schmidt',
    progress: 65,
    riskScore: 72
  },
  {
    id: 'T-002',
    auftragsNr: 'SO-8833',
    route: { from: 'Berlin', to: 'Stuttgart' },
    status: 'pünktlich',
    eta: '16:20',
    planEta: '16:30',
    delay: -10,
    position: { lat: 50.8, lng: 11.2, address: 'A9 bei Erfurt' },
    cargo: 'Maschinenbauteile (4.8t)',
    driver: 'A. Weber',
    progress: 45,
    riskScore: 25
  },
  {
    id: 'T-003',
    auftragsNr: 'SO-8834',
    route: { from: 'Köln', to: 'Dresden' },
    status: 'kritisch',
    eta: '18:15',
    planEta: '17:00',
    delay: 75,
    position: { lat: 50.9, lng: 6.9, address: 'A1 Stau bei Köln' },
    cargo: 'Chemikalien (3.2t)',
    driver: 'P. Müller',
    progress: 20,
    riskScore: 89
  },
  {
    id: 'T-004',
    auftragsNr: 'SO-8835',
    route: { from: 'Frankfurt', to: 'Nürnberg' },
    status: 'angekommen',
    eta: '12:30',
    planEta: '12:45',
    delay: -15,
    position: { lat: 49.5, lng: 11.1, address: 'Nürnberg Logistikzentrum' },
    cargo: 'Automotive Teile (5.1t)',
    driver: 'S. Fischer',
    progress: 100,
    riskScore: 5
  },
  {
    id: 'T-005',
    auftragsNr: 'SO-8836',
    route: { from: 'Düsseldorf', to: 'Leipzig' },
    status: 'pünktlich',
    eta: '15:30',
    planEta: '15:30',
    delay: 0,
    position: { lat: 51.3, lng: 7.5, address: 'A44 bei Dortmund' },
    cargo: 'Textilien (1.8t)',
    driver: 'L. Becker',
    progress: 30,
    riskScore: 35
  }
];

const GET_TRANSPORTS = `
  query GetTransports {
    transports {
      id
      auftragsNr
      route {
        from
        to
      }
      status
      eta
      planEta
      delay
      position {
        lat
        lng
        address
      }
      cargo
      driver
      progress
      riskScore
    }
  }
`;

export function useTransports() {
  const [transports, setTransports] = useState<Transport[]>(mockTransports);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const updateQueueRef = useRef<TransportUpdate[]>([]);
  const lastUpdateRef = useRef<number>(0);
  const { toast } = useToast();

  const processUpdates = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current < 200) return;
    
    if (updateQueueRef.current.length > 0) {
      const updates = [...updateQueueRef.current];
      updateQueueRef.current = [];
      
      setTransports(prevTransports => {
        const updatedTransports = [...prevTransports];
        
        updates.forEach(update => {
          const index = updatedTransports.findIndex(t => t.id === update.id);
          if (index !== -1) {
            updatedTransports[index] = { ...updatedTransports[index], ...update };
          }
        });
        
        return updatedTransports;
      });
      
      lastUpdateRef.current = now;
    }
  }, []);

  const fetchTransports = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: GET_TRANSPORTS }),
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.errors) throw new Error(data.errors[0].message);
      
      setTransports(data.data.transports);
    } catch (err) {
      console.warn('GraphQL fetch failed, using mock data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transports');
      setTransports(mockTransports);
    } finally {
      setLoading(false);
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    try {
      wsRef.current = new WebSocket(WS_URL);
      
      wsRef.current.onopen = () => {
        setConnected(true);
        wsRef.current?.send(JSON.stringify({ type: 'subscribe', channel: 'transportUpdate' }));
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'transportUpdate') {
            updateQueueRef.current.push(data.payload);
            processUpdates();
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };
      
      wsRef.current.onclose = () => {
        setConnected(false);
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.CLOSED) {
            connectWebSocket();
          }
        }, 5000);
      };
    } catch (err) {
      console.warn('WebSocket connection failed:', err);
      setConnected(false);
    }
  }, [processUpdates]);

  useEffect(() => {
    fetchTransports();
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchTransports, connectWebSocket]);

  useEffect(() => {
    const interval = setInterval(processUpdates, 200);
    return () => clearInterval(interval);
  }, [processUpdates]);

  return {
    transports,
    loading,
    error,
    connected,
    refreshTransports: fetchTransports
  };
}