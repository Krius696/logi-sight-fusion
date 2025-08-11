import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ExecutiveCockpit } from "@/components/dashboard/ExecutiveCockpit";
import { AlertsOverview } from "@/components/dashboard/AlertsOverview";
import { TransportHeatMap } from "@/components/dashboard/TransportHeatMap";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout headerActions={(
      <Link to="/integrations/n8n">
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          n8n Einstellungen
        </Button>
      </Link>
    )}>
      <div className="space-y-8">
        {/* Executive Cockpit mit Kern-KPIs */}
        <ExecutiveCockpit />
        
        {/* Transport Heat-Map für Live-Tracking */}
        <TransportHeatMap />
        
        {/* Alerts und Warnmeldungen */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AlertsOverview />
          </div>
          
          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-lg p-6 shadow-lg">
              <h3 className="font-bold text-lg text-primary mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link to="/transport-tracking" className="flex justify-between items-center bg-card/80 hover:bg-primary/10 p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] border border-border hover:border-primary/30 group">
                  <span className="text-foreground font-medium group-hover:text-primary">Transport-Tracking</span>
                  <span className="text-primary text-lg group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link to="/cost-analysis" className="flex justify-between items-center bg-card/80 hover:bg-primary/10 p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] border border-border hover:border-primary/30 group">
                  <span className="text-foreground font-medium group-hover:text-primary">Kostenanalyse</span>
                  <span className="text-primary text-lg group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link to="/inventory-optimization" className="flex justify-between items-center bg-card/80 hover:bg-primary/10 p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] border border-border hover:border-primary/30 group">
                  <span className="text-foreground font-medium group-hover:text-primary">Bestandsoptimierung</span>
                  <span className="text-primary text-lg group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link to="/ai-recommendations" className="flex justify-between items-center bg-card/80 hover:bg-primary/10 p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] border border-border hover:border-primary/30 group">
                  <span className="text-foreground font-medium group-hover:text-primary">KI-Empfehlungen</span>
                  <span className="text-primary text-lg group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">System Status</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-status-excellent rounded-full"></div>
                  <span>TMS verbunden</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-status-excellent rounded-full"></div>
                  <span>WMS verbunden</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-status-good rounded-full"></div>
                  <span>ERP synchronisiert</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-status-warning rounded-full"></div>
                  <span>IoT-Sensoren (1 offline)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
