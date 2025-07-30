import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskDetailModal } from "./RiskDetailModal";
import { 
  Truck, 
  MapPin, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Package,
  Shield,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Transport {
  id: string;
  auftragsNr: string;
  route: {
    from: string;
    to: string;
  };
  status: 'pünktlich' | 'verspätet' | 'kritisch' | 'angekommen';
  eta: string;
  planEta: string;
  delay: number; // in Minuten
  position: {
    lat: number;
    lng: number;
    address: string;
  };
  cargo: string;
  driver: string;
  progress: number; // 0-100%
  riskScore?: number; // 0-100% - ML predicted delay risk
}

// Mock-Transportdaten für Live-Tracking mit ML Risk Scores
const transports: Transport[] = [
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
    riskScore: 72 // High risk due to current delay
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
    riskScore: 25 // Low risk, ahead of schedule
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
    riskScore: 89 // Critical risk due to traffic and delay
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
    riskScore: 5 // Delivered successfully
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
    riskScore: 35 // Moderate risk due to traffic conditions
  }
];

const statusConfig = {
  'pünktlich': {
    color: 'text-status-excellent',
    bgColor: 'bg-status-excellent/10',
    borderColor: 'border-status-excellent/30',
    icon: CheckCircle
  },
  'verspätet': {
    color: 'text-status-warning',
    bgColor: 'bg-status-warning/10', 
    borderColor: 'border-status-warning/30',
    icon: Clock
  },
  'kritisch': {
    color: 'text-status-critical',
    bgColor: 'bg-status-critical/10',
    borderColor: 'border-status-critical/30',
    icon: AlertTriangle
  },
  'angekommen': {
    color: 'text-status-excellent',
    bgColor: 'bg-status-excellent/10',
    borderColor: 'border-status-excellent/30',
    icon: Package
  }
};

export function TransportHeatMap() {
  const [selectedTransport, setSelectedTransport] = useState<Transport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTransportClick = (transport: Transport) => {
    setSelectedTransport(transport);
    setIsModalOpen(true);
  };

  const activeTransports = transports.filter(t => t.status !== 'angekommen');
  const delayedTransports = transports.filter(t => t.delay > 15);
  const onTimeTransports = transports.filter(t => t.delay <= 0 && t.status !== 'angekommen');
  const highRiskTransports = transports.filter(t => t.riskScore !== undefined && t.riskScore >= 60);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Transport Live-Tracking
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="secondary" className="bg-status-excellent/20 text-status-excellent">
              {onTimeTransports.length} Pünktlich
            </Badge>
            {delayedTransports.length > 0 && (
              <Badge variant="secondary" className="bg-status-warning/20 text-status-warning">
                {delayedTransports.length} Verspätet
              </Badge>
            )}
            {highRiskTransports.length > 0 && (
              <Badge variant="secondary" className="bg-status-critical/20 text-status-critical border border-status-critical/30">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {highRiskTransports.length} High Risk
              </Badge>
            )}
            <div className="flex items-center gap-1 text-muted-foreground">
              <div className="w-2 h-2 bg-status-excellent rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transports.map((transport) => {
            const config = statusConfig[transport.status];
            const StatusIcon = config.icon;
            
            return (
              <div
                key={transport.id}
                className={cn(
                  "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
                  config.bgColor,
                  config.borderColor
                )}
                onClick={() => handleTransportClick(transport)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg", config.bgColor)}>
                      <StatusIcon className={cn("h-4 w-4", config.color)} />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {transport.auftragsNr}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {transport.id}
                        </Badge>
                        <Badge 
                          variant={transport.status === 'kritisch' ? 'destructive' : 'secondary'}
                          className={cn(
                            "text-xs",
                            transport.status === 'pünktlich' && "bg-status-excellent/20 text-status-excellent",
                            transport.status === 'verspätet' && "bg-status-warning/20 text-status-warning",
                            transport.status === 'angekommen' && "bg-status-excellent/20 text-status-excellent"
                          )}
                        >
                          {transport.status.toUpperCase()}
                        </Badge>
                        
                        {/* ML Risk Score Badge */}
                        {transport.riskScore !== undefined && (
                          <div className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            transport.riskScore >= 60 
                              ? "bg-status-critical/20 text-status-critical border border-status-critical/30" 
                              : transport.riskScore >= 40
                                ? "bg-status-warning/20 text-status-warning border border-status-warning/30"
                                : "bg-status-excellent/20 text-status-excellent border border-status-excellent/30"
                          )}>
                            {transport.riskScore >= 60 && (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                            {transport.riskScore < 60 && transport.riskScore >= 40 && (
                              <TrendingUp className="h-3 w-3" />
                            )}
                            {transport.riskScore < 40 && (
                              <Shield className="h-3 w-3" />
                            )}
                            Risk {transport.riskScore}%
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>Route</span>
                          </div>
                          <div className="font-medium">
                            {transport.route.from} → {transport.route.to}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>ETA</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{transport.eta}</span>
                            {transport.delay > 15 && (
                              <span className="text-status-critical text-xs">
                                +{transport.delay}min
                              </span>
                            )}
                            {transport.delay < 0 && (
                              <span className="text-status-excellent text-xs">
                                {transport.delay}min
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-muted-foreground text-xs">Position</div>
                          <div className="font-medium text-xs">{transport.position.address}</div>
                        </div>
                        
                        <div>
                          <div className="text-muted-foreground text-xs">Fahrer</div>
                          <div className="font-medium text-xs">{transport.driver}</div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Fortschritt</span>
                          <span>{transport.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={cn(
                              "h-2 rounded-full transition-all duration-300",
                              transport.status === 'kritisch' ? "bg-status-critical" :
                              transport.status === 'verspätet' ? "bg-status-warning" :
                              "bg-status-excellent"
                            )}
                            style={{ width: `${transport.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Schnellstatistiken */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{activeTransports.length}</div>
            <div className="text-sm text-muted-foreground">Aktive Transporte</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-status-warning">{delayedTransports.length}</div>
            <div className="text-sm text-muted-foreground">Verspätungen</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-status-excellent">
              {Math.round((onTimeTransports.length / activeTransports.length) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Pünktlichkeit</div>
          </div>
        </div>
      </CardContent>
      
      {/* Risk Detail Modal */}
      <RiskDetailModal 
        transport={selectedTransport}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Card>
  );
}