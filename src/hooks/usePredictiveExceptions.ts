import { useEffect, useState } from 'react';

interface RiskPrediction {
  transportId: string;
  riskScore: number; // 0-100
  confidence: number; // 0-1
  factors: string[];
  mitigationSuggestions?: string[];
  lastUpdated: Date;
}

interface PredictiveExceptionsAPI {
  predictions: RiskPrediction[];
  isLoading: boolean;
  error: string | null;
  refreshPredictions: () => Promise<void>;
}

/**
 * Hook for integrating with the Predictive Exception Engine
 * 
 * Backend Integration Points:
 * - ML Microservice: FastAPI endpoint for risk predictions
 * - n8n Workflow: "Delay-Prediction" workflow
 * - Flowise Agent: "Delay-Mitigation" agent (cf_87a1...)
 * 
 * TODO: Replace mock data with actual API calls once backend is deployed
 */
export function usePredictiveExceptions(): PredictiveExceptionsAPI {
  const [predictions, setPredictions] = useState<RiskPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock ML predictions - replace with actual API calls
  const mockPredictions: RiskPrediction[] = [
    {
      transportId: 'T-001',
      riskScore: 72,
      confidence: 0.89,
      factors: ['Current delay: 45min', 'Traffic congestion A7', 'Weather conditions'],
      mitigationSuggestions: ['Contact customer for delivery window', 'Alternate route via A27'],
      lastUpdated: new Date()
    },
    {
      transportId: 'T-003',
      riskScore: 89,
      confidence: 0.94,
      factors: ['Critical delay: 75min', 'Traffic jam A1', 'Hazmat cargo restrictions'],
      mitigationSuggestions: ['Emergency rerouting', 'Customer notification', 'Backup transport'],
      lastUpdated: new Date()
    },
    {
      transportId: 'T-005',
      riskScore: 35,
      confidence: 0.76,
      factors: ['Moderate traffic A44', 'Driver experience: high'],
      lastUpdated: new Date()
    }
  ];

  const refreshPredictions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call to ML microservice
      // const response = await fetch('/api/ml/predict-delays', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPredictions(mockPredictions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch predictions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshPredictions();
    
    // Set up real-time updates (WebSocket or polling)
    const interval = setInterval(refreshPredictions, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return {
    predictions,
    isLoading,
    error,
    refreshPredictions
  };
}

/**
 * Integration Documentation for Backend Team:
 * 
 * 1. ML Microservice (FastAPI):
 *    POST /api/v1/predict-delays
 *    Body: { transport_ids: string[], features: TransportFeatures[] }
 *    Response: { predictions: RiskPrediction[] }
 * 
 * 2. n8n Workflow "Delay-Prediction":
 *    - Triggered every 5 minutes
 *    - Fetches transport data from TimescaleDB
 *    - Calls ML microservice
 *    - Updates risk_predictions table
 * 
 * 3. Flowise Agent "Delay-Mitigation" (cf_87a1...):
 *    POST /api/v1/chatflow/cf_87a1.../invoke
 *    Body: { inputs: { transport_id, risk_score, context } }
 *    Response: { suggestions: string[] }
 * 
 * 4. WebSocket Updates:
 *    Topic: "risk_updates"
 *    Payload: { transport_id, risk_score, timestamp }
 */