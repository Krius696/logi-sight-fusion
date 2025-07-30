import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTransports } from "@/hooks/useTransports";
import { MapPin, Clock, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TransportTracking = () => {
  const { transports, loading, connected } = useTransports();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pünktlich': return 'bg-status-excellent';
      case 'verspätet': return 'bg-status-warning';  
      case 'kritisch': return 'bg-status-critical';
      case 'angekommen': return 'bg-status-good';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'angekommen': return <CheckCircle className="w-4 h-4" />;
      case 'kritisch': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Transport-Tracking</h1>
              <p className="text-muted-foreground">Live-Verfolgung aller aktiven Transporte</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-status-excellent animate-pulse' : 'bg-status-critical'}`}></div>
            <span className="text-sm text-muted-foreground">
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Transport Liste */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Lade Transporte...</p>
            </div>
          ) : (
            transports.map((transport) => (
              <Card key={transport.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(transport.status)}`}></div>
                      <div>
                        <CardTitle className="text-lg">{transport.auftragsNr}</CardTitle>
                        <CardDescription>
                          {transport.route.from} → {transport.route.to}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-2">
                      {getStatusIcon(transport.status)}
                      {transport.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{transport.position.address}</p>
                        <p className="text-xs text-muted-foreground">Aktuelle Position</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          ETA: {transport.eta}
                          {transport.delay !== 0 && (
                            <span className={`ml-2 text-xs ${transport.delay > 0 ? 'text-status-warning' : 'text-status-excellent'}`}>
                              ({transport.delay > 0 ? '+' : ''}{transport.delay} min)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">Geplant: {transport.planEta}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{transport.driver}</p>
                      <p className="text-xs text-muted-foreground">{transport.cargo}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-muted-foreground">Fortschritt</span>
                      <span className="text-xs text-muted-foreground">{transport.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${transport.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TransportTracking;