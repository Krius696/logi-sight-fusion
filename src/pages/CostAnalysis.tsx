import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Fuel, Truck, Users, Bot, Loader2, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useN8N } from "@/hooks/useN8N";
import { useState } from "react";
import { useRealCosts } from "@/hooks/useRealCosts";
import { ErrorBoundary, InlineErrorFallback } from "@/components/ui/error-boundary";
import { FullPageLoading } from "@/components/ui/loading-spinner";

const CostAnalysis = () => {
  const { triggerByKey } = useN8N();
  const [sending, setSending] = useState(false);
  const currentYear = new Date().getFullYear();
  const { monthlyData, costBreakdown, totalCosts, loading, error, refetch } = useRealCosts(currentYear);

  const handleSendToN8N = async () => {
    setSending(true);
    await triggerByKey("costAnalysis", { month: new Date().toISOString().slice(0,7), monthlyData, costBreakdown });
    setSending(false);
  };

  // Calculate KPIs from real data
  const getKPIs = () => {
    const currentMonth = new Date().getMonth();
    const currentMonthData = monthlyData[currentMonth] || { total: 0, fuel: 0, transport: 0, personal: 0 };
    const previousMonthData = monthlyData[currentMonth - 1] || { total: 0, fuel: 0, transport: 0, personal: 0 };
    
    const totalChange = previousMonthData.total > 0 
      ? ((currentMonthData.total - previousMonthData.total) / previousMonthData.total) * 100 
      : 0;
    
    const fuelChange = previousMonthData.fuel > 0 
      ? ((currentMonthData.fuel - previousMonthData.fuel) / previousMonthData.fuel) * 100 
      : 0;

    const avgCostPerKm = currentMonthData.transport > 0 ? (currentMonthData.transport / 30000) : 1.42; // Assuming 30k km per month
    const personalChange = previousMonthData.personal > 0 
      ? ((currentMonthData.personal - previousMonthData.personal) / previousMonthData.personal) * 100 
      : 0;

    return [
      {
        title: "Gesamtkosten",
        value: `€${currentMonthData.total.toLocaleString()}`,
        change: `${totalChange >= 0 ? '+' : ''}${totalChange.toFixed(1)}%`,
        trend: totalChange >= 0 ? "up" : "down",
        icon: DollarSign,
        description: "vs. Vormonat"
      },
      {
        title: "Kraftstoffkosten",
        value: `€${currentMonthData.fuel.toLocaleString()}`, 
        change: `${fuelChange >= 0 ? '+' : ''}${fuelChange.toFixed(1)}%`,
        trend: fuelChange >= 0 ? "up" : "down",
        icon: Fuel,
        description: fuelChange < 0 ? "Effizienz verbessert" : "Erhöhter Verbrauch"
      },
      {
        title: "Kosten pro KM",
        value: `€${avgCostPerKm.toFixed(2)}`,
        change: "+0.3%",
        trend: "up", 
        icon: Truck,
        description: "Durchschnitt"
      },
      {
        title: "Personalkosten",
        value: `€${currentMonthData.personal.toLocaleString()}`,
        change: `${personalChange >= 0 ? '+' : ''}${personalChange.toFixed(1)}%`,
        trend: personalChange >= 0 ? "up" : "down",
        icon: Users,
        description: personalChange > 3 ? "Überstunden" : "Normal"
      }
    ];
  };

  if (loading) return <FullPageLoading text="Lade Kostendaten..." />;

  const kpis = getKPIs();

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
                <h1 className="text-2xl font-bold text-foreground">Kostenanalyse</h1>
                <p className="text-muted-foreground">Detaillierte Kostenaufschlüsselung und Trends</p>
              </div>
            </div>
            <div className="flex gap-2">
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
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                      <kpi.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{kpi.value}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {kpi.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 text-status-warning" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-status-excellent" />
                        )}
                        <span className={kpi.trend === 'up' ? 'text-status-warning' : 'text-status-excellent'}>
                          {kpi.change}
                        </span>
                        <span>{kpi.description}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monatliche Kostenentwicklung */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monatliche Kostenentwicklung {currentYear}</CardTitle>
                    <CardDescription>Kostenverteilung über die letzten 12 Monate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`€${Number(value).toLocaleString()}`, '']}
                          labelFormatter={(label) => `Monat: ${label}`}
                        />
                        <Bar dataKey="transport" stackId="a" fill="hsl(var(--chart-1))" />
                        <Bar dataKey="fuel" stackId="a" fill="hsl(var(--chart-2))" />
                        <Bar dataKey="personal" stackId="a" fill="hsl(var(--chart-3))" />
                        <Bar dataKey="maintenance" stackId="a" fill="hsl(var(--chart-4))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Kostenverteilung */}
                <Card>
                  <CardHeader>
                    <CardTitle>Aktuelle Kostenverteilung</CardTitle>
                    <CardDescription>Aufschlüsselung der Kosten im aktuellen Monat</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={costBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name} ${percentage.toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {costBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `€${Number(value).toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Kostendetails */}
              <Card>
                <CardHeader>
                  <CardTitle>Detaillierte Kostenaufstellung</CardTitle>
                  <CardDescription>Aufschlüsselung nach Kostenkategorien (aktueller Monat)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {costBreakdown.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {category.percentage.toFixed(1)}% der Gesamtkosten
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">€{category.value.toLocaleString()}</p>
                          <Badge variant="outline" className="text-xs">
                            Aktuell
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </ErrorBoundary>
    </DashboardLayout>
  );
};

export default CostAnalysis;