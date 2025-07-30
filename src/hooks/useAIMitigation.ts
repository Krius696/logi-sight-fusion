import { useState, useCallback } from 'react';
import { MitigationAnalysis } from '@/types';

const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:3001';

// Mock response for fallback
const mockAnalysis: MitigationAnalysis = {
  shipmentId: '',
  rootCause: 'Verkehrsstau auf A1 kombiniert mit schlechten Wetterbedingungen führt zu erheblichen Verzögerungen',
  recommendations: [
    {
      priority: 'high',
      action: 'Alternative Route über A7 wählen',
      impact: 'Reduziert Verspätung um 30-45 Minuten',
      timeline: 'Sofort umsetzbar'
    },
    {
      priority: 'medium', 
      action: 'Kunde über Verspätung informieren',
      impact: 'Verbessert Kundenzufriedenheit',
      timeline: '5 Minuten'
    },
    {
      priority: 'low',
      action: 'Zusätzlichen Puffer für zukünftige Routen einplanen',
      impact: 'Reduziert zukünftige Risiken',
      timeline: 'Nächste Planungsphase'
    }
  ],
  riskFactors: [
    'Hohes Verkehrsaufkommen zur Hauptverkehrszeit',
    'Wetterwarnungen für die Region',
    'Kritische Fracht erfordert pünktliche Lieferung'
  ],
  predictedOutcome: {
    withMitigation: 'Verspätung reduziert sich auf 15-20 Minuten, Kunde zufrieden',
    withoutMitigation: 'Verspätung steigt auf 60+ Minuten, Kundenbeschwerden wahrscheinlich'
  }
};

export function useAIMitigation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMitigationAnalysis = useCallback(async (shipmentId: string): Promise<MitigationAnalysis> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${AI_API_URL}/ai/mitigation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shipment_id: shipmentId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        ...data,
        shipmentId
      };
    } catch (err) {
      console.warn('AI mitigation API failed, using mock data:', err);
      setError(err instanceof Error ? err.message : 'Failed to get AI analysis');
      
      // Return mock data as fallback
      return {
        ...mockAnalysis,
        shipmentId
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getMitigationAnalysis,
    loading,
    error
  };
}