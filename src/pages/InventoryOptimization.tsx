import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Package, AlertTriangle, TrendingUp, BarChart3, RefreshCw, Bot, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useN8N } from "@/hooks/useN8N";
import { useState } from "react";
import { useRealInventory } from "@/hooks/useRealInventory";
import { ErrorBoundary, InlineErrorFallback } from "@/components/ui/error-boundary";
import { FullPageLoading } from "@/components/ui/loading-spinner";

const InventoryOptimization = () => {
  const { triggerByKey } = useN8N();
  const [sending, setSending] = useState(false);
  const { items, criticalItems, loading, error, refetch } = useRealInventory();

  const handleSendToN8N = async () => {
    setSending(true);
    await triggerByKey("inventoryOptimization", { items, criticalItems });
    setSending(false);
  };

  // Mock data for charts (will be replaced with real calculations later)
  const inventoryData = [
    { week: 'KW 20', bestand: 85, bedarf: 75, optimal: 80 },
    { week: 'KW 21', bestand: 72, bedarf: 80, optimal: 80 },
    { week: 'KW 22', bestand: 88, bedarf: 70, optimal: 80 },
    { week: 'KW 23', bestand: 76, bedarf: 85, optimal: 80 },
    { week: 'KW 24', bestand: 82, bedarf: 78, optimal: 80 },
    { week: 'KW 25', bestand: 79, bedarf: 82, optimal: 80 }
  ];

  const turnoverData = [
    { kategorie: 'Elektronik', umschlag: 12.5, optimal: 15, status: 'warning' },
    { kategorie: 'Automotive', umschlag: 18.2, optimal: 16, status: 'excellent' },
    { kategorie: 'Textilien', umschlag: 8.1, optimal: 12, status: 'critical' },
    { kategorie: 'Chemikalien', umschlag: 14.7, optimal: 14, status: 'good' },
    { kategorie: 'Maschinenbau', umschlag: 6.3, optimal: 8, status: 'warning' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'kritisch': return 'bg-status-critical';
      case 'niedrig': return 'bg-status-warning';
      case 'normal': return 'bg-status-good';
      case 'überbestand': return 'bg-chart-2';
      default: return 'bg-muted';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'kritisch': return { variant: 'destructive' as const, text: 'Kritisch' };
      case 'niedrig': return { variant: 'secondary' as const, text: 'Niedrig' };
      case 'normal': return { variant: 'outline' as const, text: 'Normal' };
      case 'überbestand': return { variant: 'secondary' as const, text: 'Überbestand' };
      default: return { variant: 'outline' as const, text: 'Unbekannt' };
    }
  };

  // Calculate KPIs from real data
  const totalValue = items.reduce((sum, item) => sum + (item.currentStock * 10), 0); // Assuming €10 per unit average
  const criticalCount = criticalItems.length;
  const averageTurnover = 11.8; // This would be calculated from real data
  const utilizationRate = 78; // This would be calculated from real warehouse data

  if (loading) return <FullPageLoading text="Lade Bestandsdaten..." />;

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
                <h1 className="text-2xl font-bold text-foreground">Bestandsoptimierung</h1>
                <p className="text-muted-foreground">Intelligente Lagerbestandsverwaltung und -optimierung</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refetch}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Aktualisieren
              </Button>
              <Button variant="outline" size="sm" onClick={handleSendToN8N} disabled={sending}>
                {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
                An n8n senden
              </Button>
            </div>
          </div>

          {error ? (
            <InlineErrorFallback error={error} retry={refetch} />
          ) : (
            <>
              {/* KPI Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gesamtbestand</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">€{totalValue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-status-excellent">-3.2%</span> vs. Vormonat
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Umschlaghäufigkeit</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{averageTurnover}x</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-status-excellent">+5.2%</span> Effizienz
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Kritische Artikel</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{criticalCount}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className={criticalCount > 10 ? "text-status-warning" : "text-status-excellent"}>
                        {criticalCount > 10 ? "Erhöht" : "Normal"}
                      </span>
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lagerauslastung</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{utilizationRate}%</div>
                    <Progress value={utilizationRate} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bestandsentwicklung */}
                <Card>
                  <CardHeader>
                    <CardTitle>Bestandsentwicklung</CardTitle>
                    <CardDescription>Ist-Bestand vs. Optimal-Bestand</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={inventoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="bestand" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Ist-Bestand" />
                        <Line type="monotone" dataKey="bedarf" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Bedarf" />
                        <Line type="monotone" dataKey="optimal" stroke="hsl(var(--chart-3))" strokeWidth={2} strokeDasharray="5 5" name="Optimal" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Umschlaghäufigkeit nach Kategorie */}
                <Card>
                  <CardHeader>
                    <CardTitle>Umschlaghäufigkeit nach Kategorie</CardTitle>
                    <CardDescription>Ist vs. Ziel-Umschlag pro Jahr</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={turnoverData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="kategorie" type="category" width={80} />
                        <Tooltip />
                        <Bar dataKey="umschlag" fill="hsl(var(--chart-1))" name="Ist-Umschlag" />
                        <Bar dataKey="optimal" fill="hsl(var(--chart-3))" name="Ziel-Umschlag" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Kritische Artikel */}
              <Card>
                <CardHeader>
                  <CardTitle>Kritische Artikel</CardTitle>
                  <CardDescription>Artikel mit Bestandswarnung oder Überbestand</CardDescription>
                </CardHeader>
                <CardContent>
                  {criticalItems.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Keine kritischen Artikel</h3>
                      <p className="text-muted-foreground">Alle Bestände sind innerhalb der optimalen Bereiche.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {criticalItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}></div>
                            <div>
                              <p className="font-medium">{item.sku}</p>
                              <p className="text-sm text-muted-foreground">{item.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {item.currentStock} / {item.minStock} {item.unit}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Nächste Lieferung: {item.nextDelivery || 'Unbekannt'}
                              </p>
                            </div>
                            <Badge {...getStatusBadge(item.status)}>
                              {getStatusBadge(item.status).text}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </ErrorBoundary>
    </DashboardLayout>
  );
};

export default InventoryOptimization;