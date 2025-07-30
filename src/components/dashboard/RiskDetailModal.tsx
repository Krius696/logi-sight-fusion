import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAIMitigation } from "@/hooks/useAIMitigation";
import { Transport } from "@/types";
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  TrendingUp,
  Shield,
  User,
  Package,
  Route,
  Loader2,
  Brain,
  CheckCircle2,
  AlertCircle,
  Bot,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskDetailModalProps {
  transport: Transport | null;
  isOpen: boolean;
  onClose: () => void;
}

// Mock mitigation suggestions from Flowise agent
const getMitigationSuggestions = (riskScore: number) => {
  if (riskScore >= 80) {
    return [
      "🚨 Sofortige Kundenbenachrichtigung erforderlich",
      "🔄 Alternative Route über A27 prüfen (-15 min)",
      "📞 Backup-Transport für kritische Fracht organisieren",
      "⚡ Prioritätsstatus für Verkehrslenkung anfordern"
    ];
  } else if (riskScore >= 60) {
    return [
      "📱 Proaktive Kundenkommunikation starten",
      "🗺️ Dynamische Routenoptimierung aktivieren",
      "👨‍💼 Supervisor über potenzielle Verspätung informieren",
      "📊 Monitoring-Intervall auf 5 min reduzieren"
    ];
  } else {
    return [
      "✅ Transport läuft planmäßig",
      "📍 Standardüberwachung fortsetzen",
      "🎯 Preventive Maßnahmen erfolgreich"
    ];
  }
};

export function RiskDetailModal({ transport, isOpen, onClose }: RiskDetailModalProps) {
  const { getMitigationAnalysis, loading: aiLoading, error: aiError } = useAIMitigation();
  const [mitigationData, setMitigationData] = useState<any>(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  // Reset analysis data when modal opens with new transport
  useEffect(() => {
    if (isOpen && transport) {
      setMitigationData(null);
      setShowAIAnalysis(false);
    }
  }, [isOpen, transport?.id]);

  const handleAIAnalysis = async () => {
    if (!transport) return;
    
    setShowAIAnalysis(true);
    try {
      const analysis = await getMitigationAnalysis(transport.id);
      setMitigationData(analysis);
    } catch (error) {
      console.error('Failed to get AI analysis:', error);
    }
  };

  if (!transport) return null;

  const riskScore = transport.riskScore || 0;
  const suggestions = getMitigationSuggestions(riskScore);
  
  const getRiskColor = (score: number) => {
    if (score >= 60) return "text-status-critical";
    if (score >= 40) return "text-status-warning";
    return "text-status-excellent";
  };

  const getRiskIcon = (score: number) => {
    if (score >= 60) return AlertTriangle;
    if (score >= 40) return TrendingUp;
    return Shield;
  };

  const RiskIcon = getRiskIcon(riskScore);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RiskIcon className={cn("h-5 w-5", getRiskColor(riskScore))} />
            Risiko-Analyse: {transport.auftragsNr}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Transport Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Route</div>
                  <div className="font-medium">{transport.route.from} → {transport.route.to}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">ETA</div>
                  <div className="font-medium">{transport.eta}</div>
                  {transport.delay > 0 && (
                    <div className="text-sm text-status-critical">+{transport.delay} min Verspätung</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Fahrer</div>
                  <div className="font-medium">{transport.driver}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Fracht</div>
                  <div className="font-medium">{transport.cargo}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Position */}
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Aktuelle Position</span>
            </div>
            <div className="text-sm text-muted-foreground">{transport.position.address}</div>
          </div>

          {/* Risk Assessment */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <RiskIcon className={cn("h-5 w-5", getRiskColor(riskScore))} />
              <h3 className="text-lg font-semibold">Risiko-Bewertung</h3>
              <Badge variant={riskScore >= 60 ? "destructive" : riskScore >= 40 ? "secondary" : "outline"}>
                {riskScore}% Risiko
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">ML-basierte Empfehlungen</h4>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Mitigation Analysis Section */}
          <div className="space-y-4">
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">KI-Risiko Analyse</h3>
              </div>
              
              {!showAIAnalysis && (
                <Button 
                  onClick={handleAIAnalysis}
                  disabled={aiLoading}
                  className="gap-2"
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Brain className="h-4 w-4" />
                  )}
                  Analyse starten
                </Button>
              )}
            </div>

            {showAIAnalysis && (
              <div className="space-y-4">
                {aiLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>KI analysiert Risikofaktoren...</span>
                    </div>
                  </div>
                )}

                {aiError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-status-critical/10 border border-status-critical/30">
                    <AlertCircle className="h-4 w-4 text-status-critical" />
                    <span className="text-sm text-status-critical">
                      Analyse fehlgeschlagen: {aiError}
                    </span>
                  </div>
                )}

                {mitigationData && (
                  <div className="space-y-4">
                    {/* Root Cause */}
                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-status-warning" />
                        Ursachenanalyse
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {mitigationData.rootCause}
                      </p>
                    </div>

                    {/* Risk Factors */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Identifizierte Risikofaktoren</h4>
                      <div className="space-y-1">
                        {mitigationData.riskFactors.map((factor: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <div className="w-1 h-1 rounded-full bg-status-warning mt-2 flex-shrink-0" />
                            <span className="text-muted-foreground">{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Empfohlene Maßnahmen</h4>
                      {mitigationData.recommendations.map((rec: any, index: number) => (
                        <div key={index} className="p-3 rounded-lg border bg-card">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={rec.priority === 'high' ? 'destructive' : 
                                       rec.priority === 'medium' ? 'secondary' : 'outline'}
                                className="text-xs"
                              >
                                {rec.priority === 'high' ? 'Hohe Priorität' :
                                 rec.priority === 'medium' ? 'Mittlere Priorität' : 'Niedrige Priorität'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{rec.timeline}</span>
                            </div>
                          </div>
                          <p className="font-medium text-sm mb-1">{rec.action}</p>
                          <p className="text-xs text-muted-foreground">{rec.impact}</p>
                        </div>
                      ))}
                    </div>

                    {/* Predicted Outcomes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-status-critical/10 border border-status-critical/30">
                        <h5 className="font-medium text-sm mb-1 flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-status-critical" />
                          Ohne Maßnahmen
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          {mitigationData.predictedOutcome.withoutMitigation}
                        </p>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-status-excellent/10 border border-status-excellent/30">
                        <h5 className="font-medium text-sm mb-1 flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-status-excellent" />
                          Mit Maßnahmen
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          {mitigationData.predictedOutcome.withMitigation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}