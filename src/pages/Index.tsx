import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ExecutiveCockpit } from "@/components/dashboard/ExecutiveCockpit";
import { AlertsOverview } from "@/components/dashboard/AlertsOverview";
import { TransportHeatMap } from "@/components/dashboard/TransportHeatMap";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <DashboardLayout>
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
          
          {/* Quick Actions Placeholder */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Quick Actions</h3>
              <div className="space-y-2 text-sm">
                <Link to="/transport-tracking" className="flex justify-between items-center hover:bg-muted/50 p-2 rounded transition-colors">
                  <span className="text-muted-foreground hover:text-foreground">Transport-Tracking</span>
                  <span className="text-chart-primary">→</span>
                </Link>
                <Link to="/cost-analysis" className="flex justify-between items-center hover:bg-muted/50 p-2 rounded transition-colors">
                  <span className="text-muted-foreground hover:text-foreground">Kostenanalyse</span>
                  <span className="text-chart-primary">→</span>
                </Link>
                <Link to="/inventory-optimization" className="flex justify-between items-center hover:bg-muted/50 p-2 rounded transition-colors">
                  <span className="text-muted-foreground hover:text-foreground">Bestandsoptimierung</span>
                  <span className="text-chart-primary">→</span>
                </Link>
                <Link to="/ai-recommendations" className="flex justify-between items-center hover:bg-muted/50 p-2 rounded transition-colors">
                  <span className="text-muted-foreground hover:text-foreground">KI-Empfehlungen</span>
                  <span className="text-chart-primary">→</span>
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
