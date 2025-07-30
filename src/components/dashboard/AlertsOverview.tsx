import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle, 
  Clock, 
  Package, 
  TrendingDown,
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  category: 'transport' | 'inventory' | 'cost' | 'planning';
  actionRequired: boolean;
}

// Mock-Alerts
const mockAlerts: AlertItem[] = [
  {
    id: '1',
    type: 'critical',
    title: 'Unterbestand: Artikel A-4711',
    description: 'Nur noch 2 Tage Reichweite. Bestellung erforderlich.',
    timestamp: '09:23',
    category: 'inventory',
    actionRequired: true
  },
  {
    id: '2',
    type: 'warning',
    title: 'Sendung SP-8832 verspätet',
    description: 'ETA überschritten um 45 Min. Kunde informiert.',
    timestamp: '08:47',
    category: 'transport',
    actionRequired: false
  },
  {
    id: '3',
    type: 'warning',
    title: 'Frachtkosten Route München-Hamburg',
    description: 'Kosten 15% über Budget. Alternativen prüfen.',
    timestamp: '08:12',
    category: 'cost',
    actionRequired: true
  },
  {
    id: '4',
    type: 'info',
    title: 'Kapazitätsengpass Lager Nord',
    description: 'Auslastung 89%. Monitoring empfohlen.',
    timestamp: '07:55',
    category: 'planning',
    actionRequired: false
  }
];

const alertTypeConfig = {
  critical: {
    icon: AlertTriangle,
    className: 'border-status-critical bg-status-critical/5',
    iconColor: 'text-status-critical'
  },
  warning: {
    icon: Clock,
    className: 'border-status-warning bg-status-warning/5',
    iconColor: 'text-status-warning'
  },
  info: {
    icon: Package,
    className: 'border-status-good bg-status-good/5',
    iconColor: 'text-status-good'
  }
};

const categoryLabels = {
  transport: 'Transport',
  inventory: 'Bestand',
  cost: 'Kosten',
  planning: 'Planung'
};

export function AlertsOverview() {
  const handleDismissAlert = (alertId: string) => {
    console.log(`Alert ${alertId} dismissed`);
    // Hier würde normalerweise der Alert aus dem State entfernt
  };

  const handleAlertAction = (alertId: string) => {
    console.log(`Action for alert ${alertId} requested`);
    // Hier würde normalerweise eine Aktion ausgelöst (z.B. Bestellvorschlag öffnen)
  };

  const criticalCount = mockAlerts.filter(a => a.type === 'critical').length;
  const warningCount = mockAlerts.filter(a => a.type === 'warning').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Aktuelle Warnmeldungen
          </CardTitle>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalCount} Kritisch
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="text-xs bg-status-warning/20 text-status-warning">
                {warningCount} Warnung
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Keine aktuellen Warnmeldungen</p>
            </div>
          ) : (
            mockAlerts.map((alert) => {
              const config = alertTypeConfig[alert.type];
              const Icon = config.icon;
              
              return (
                <Alert key={alert.id} className={config.className}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Icon className={`h-4 w-4 mt-0.5 ${config.iconColor}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTitle className="text-sm font-medium">
                            {alert.title}
                          </AlertTitle>
                          <Badge variant="outline" className="text-xs">
                            {categoryLabels[alert.category]}
                          </Badge>
                        </div>
                        <AlertDescription className="text-xs text-muted-foreground">
                          {alert.description}
                        </AlertDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {alert.timestamp}
                          </span>
                          {alert.actionRequired && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs px-2"
                              onClick={() => handleAlertAction(alert.id)}
                            >
                              Aktion
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => handleDismissAlert(alert.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </Alert>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}