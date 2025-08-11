import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRealTransports } from "@/hooks/useRealTransports";
import { MapPin, Clock, AlertTriangle, CheckCircle, ArrowLeft, Bot, Loader2, Package, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useN8N } from "@/hooks/useN8N";
import { ErrorBoundary, InlineErrorFallback } from "@/components/ui/error-boundary";
import { FullPageLoading } from "@/components/ui/loading-spinner";

const TransportTracking = () => {
  const { transports, loading, error, refetch } = useRealTransports();
  const { triggerByKey } = useN8N();
  const [sending, setSending] = useState(false);

  const handleSendToN8N = async () => {
    setSending(true);
    await triggerByKey("transportTracking", {
      transports: transports.map((t) => ({ id: t.id, status: t.status, route: t.route })),
    });
    setSending(false);
  };

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

  if (loading) return <FullPageLoading text="Lade Transportdaten..." />;

  return (
    <DashboardLayout>
      <ErrorBoundary fallback={InlineErrorFallback}>
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
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={refetch}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Aktualisieren
              </Button>
              <Button variant="outline" size="sm" onClick={handleSendToN8N} disabled={sending || loading}>
                {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
                An n8n senden
              </Button>
            </div>
          </div>

          {error ? (
            <InlineErrorFallback error={error} retry={refetch} />
          ) : transports.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Transporte gefunden</h3>
              <p className="text-muted-foreground">Es sind derzeit keine aktiven Transporte vorhanden.</p>
            </div>
          ) : (
            /* Transport Liste */
            <div className="grid gap-4">
              {transports.map((transport) => (
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
                      <Progress value={transport.progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ErrorBoundary>
    </DashboardLayout>
  );
};

export default TransportTracking;