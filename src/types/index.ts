export interface Transport {
  id: string;
  auftragsNr: string;
  route: {
    from: string;
    to: string;
  };
  status: 'pünktlich' | 'verspätet' | 'kritisch' | 'angekommen';
  eta: string;
  planEta: string;
  delay: number;
  position: {
    lat: number;
    lng: number;
    address: string;
  };
  cargo: string;
  driver: string;
  progress: number;
  riskScore?: number;
}

export interface TransportUpdate {
  id: string;
  status?: Transport['status'];
  eta?: string;
  delay?: number;
  position?: Transport['position'];
  progress?: number;
  riskScore?: number;
}

export interface MitigationAnalysis {
  shipmentId: string;
  rootCause: string;
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    impact: string;
    timeline: string;
  }[];
  riskFactors: string[];
  predictedOutcome: {
    withMitigation: string;
    withoutMitigation: string;
  };
}