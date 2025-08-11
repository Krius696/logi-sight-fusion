import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAIMitigation } from "@/hooks/useAIMitigation";
import { ArrowLeft, Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Zap, Bot, Loader2, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useN8N } from "@/hooks/useN8N";
import { useRealAIRecommendations } from "@/hooks/useRealAIRecommendations";
import { ErrorBoundary, InlineErrorFallback } from "@/components/ui/error-boundary";
import { FullPageLoading } from "@/components/ui/loading-spinner";

const AIRecommendations = () => {
  const { getMitigationAnalysis, loading: analysisLoading } = useAIMitigation();
  const [analysis, setAnalysis] = useState(null);
  const { triggerByKey } = useN8N();
  const [sending, setSending] = useState(false);
  const { 
    recommendations, 
    activeRecommendations, 
    loading, 
    error, 
    refetch, 
    updateStatus,
    updating 
  } = useRealAIRecommendations();

  const insights = [
    {
      title: "Verspätungsrisiko",
      value: "23%",
      change: "-8%",
      trend: "down",
      description: "Reduziert durch Routenoptimierung"
    },
    {
      title: "Kostenersparnis",
      value: "€6.750",
      change: "+12%",
      trend: "up", 
      description: "Potenzial diesen Monat"
    },
    {
      title: "Effizienzsteigerung",
      value: "15.2%",
      change: "+3.1%",
      trend: "up",
      description: "Durch AI-Optimierungen"
    },
    {
      title: "Recommendations Accuracy",
      value: `${Math.round((activeRecommendations.length / Math.max(recommendations.length, 1)) * 100)}%`,
      change: "+2%",
      trend: "up",
      description: "Durchschnittliche Vorhersagegenauigkeit"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-status-critical';
      case 'medium': return 'bg-status-warning';
      case 'low': return 'bg-status-good';
      default: return 'bg-muted';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return { variant: 'destructive' as const, text: 'Hoch' };
      case 'medium': return { variant: 'secondary' as const, text: 'Mittel' };
      case 'low': return { variant: 'outline' as const, text: 'Niedrig' };
      default: return { variant: 'outline' as const, text: 'Unbekannt' };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'transport': return <TrendingUp className="w-4 h-4" />;
      case 'bestand': 
      case 'inventory': return <CheckCircle className="w-4 h-4" />;
      case 'wartung':
      case 'maintenance': return <AlertTriangle className="w-4 h-4" />;
      case 'energie':
      case 'energy': return <Zap className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const loadAIAnalysis = async () => {
    const result = await getMitigationAnalysis('T-001');
    setAnalysis(result);
  };

  const handleSendToN8N = async () => {
    setSending(true);
    await triggerByKey("aiRecommendations", { recommendations: activeRecommendations });
    setSending(false);
  };

  const handleImplementRecommendation = async (id: string) => {
    await updateStatus({ id, status: 'completed' });
  };

  const handleDismissRecommendation = async (id: string) => {
    await updateStatus({ id, status: 'dismissed' });
  };

  if (loading) return <FullPageLoading text="Lade KI-Empfehlungen..." />;

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
                <h1 className="text-2xl font-bold text-foreground">KI-Empfehlungen</h1>
                <p className="text-muted-foreground">Intelligente Optimierungsvorschläge für Ihre Logistik</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={refetch}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Aktualisieren
              </Button>
              <Button variant="outline" size="sm" onClick={loadAIAnalysis} disabled={analysisLoading}>
                <Brain className="w-4 h-4 mr-2" />
                {analysisLoading ? 'Lädt...' : 'Analyse laden'}
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
              {/* AI Insights KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {insights.map((insight, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
                      <Brain className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{insight.value}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {insight.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 text-status-excellent" />
                        ) : (
                          <TrendingUp className="h-3 w-3 text-status-excellent rotate-180" />
                        )}
                        <span className="text-status-excellent">{insight.change}</span>
                        <span>{insight.description}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* AI Analysis Result */}
              {analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      AI-Analyse für Transport {analysis.shipmentId}
                    </CardTitle>
                    <CardDescription>Detaillierte Risikoanalyse und Empfehlungen</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Ursachenanalyse</h4>
                      <p className="text-sm text-muted-foreground">{analysis.rootCause}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Risikofaktoren</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {analysis.riskFactors?.map((factor, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Handlungsempfehlungen</h4>
                      <div className="space-y-2">
                        {analysis.recommendations?.map((rec, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(rec.priority)}`}></div>
                              <div>
                                <p className="text-sm font-medium">{rec.action}</p>
                                <p className="text-xs text-muted-foreground">{rec.impact}</p>
                              </div>
                            </div>
                            <Badge {...getPriorityBadge(rec.priority)}>
                              {getPriorityBadge(rec.priority).text}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Active Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Aktive Empfehlungen</CardTitle>
                  <CardDescription>KI-generierte Optimierungsvorschläge basierend auf aktuellen Daten</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeRecommendations.length === 0 ? (
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Keine aktiven Empfehlungen</h3>
                      <p className="text-muted-foreground">Alle Empfehlungen wurden bearbeitet oder es liegen derzeit keine vor.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeRecommendations.map((rec) => (
                        <div key={rec.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(rec.priority)}`}></div>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(rec.category)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{rec.title}</h4>
                              <p className="text-sm text-muted-foreground">{rec.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {rec.timeline}
                                </span>
                                <span>Kategorie: {rec.category}</span>
                                {rec.savingsPotential && (
                                  <span className="text-status-excellent">€{rec.savingsPotential.toLocaleString()} Ersparnis</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge {...getPriorityBadge(rec.priority)}>
                              {getPriorityBadge(rec.priority).text}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleImplementRecommendation(rec.id)}
                              disabled={updating}
                            >
                              Umsetzen
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDismissRecommendation(rec.id)}
                              disabled={updating}
                            >
                              Verwerfen
                            </Button>
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

export default AIRecommendations;