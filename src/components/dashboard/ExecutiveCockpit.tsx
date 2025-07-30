import { useState } from "react";
import { KPICard, KPIStatus } from "./KPICard";
import { KPIDetailModal } from "./KPIDetailModal";
import { 
  Euro, 
  Clock, 
  RotateCcw, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Package,
  Truck
} from "lucide-react";

// Mock-Daten für die KPIs
const kpiData = {
  logistikkosten: {
    current: 7.2,
    target: 7.0,
    trend: { value: -0.8, isPositive: true },
    status: 'good' as KPIStatus
  },
  termintreue: {
    current: 96.8,
    target: 97.0,
    trend: { value: 1.2, isPositive: true },
    status: 'excellent' as KPIStatus
  },
  lagerumschlag: {
    current: 12.4,
    target: 12.0,
    trend: { value: 3.2, isPositive: true },
    status: 'excellent' as KPIStatus
  },
  c2cZyklus: {
    current: 28,
    target: 25,
    trend: { value: -2.1, isPositive: true },
    status: 'warning' as KPIStatus
  }
};

// Mock-Daten für Schnellübersicht
const quickStats = [
  {
    label: "Aktive Sendungen",
    value: 342,
    icon: Truck,
    status: 'excellent' as KPIStatus
  },
  {
    label: "Kritische Bestände",
    value: 8,
    icon: AlertTriangle,
    status: 'warning' as KPIStatus
  },
  {
    label: "Heute termingerecht",
    value: 127,
    icon: CheckCircle,
    status: 'excellent' as KPIStatus
  },
  {
    label: "Lagerbelegung",
    value: "87%",
    icon: Package,
    status: 'good' as KPIStatus
  }
];

export function ExecutiveCockpit() {
  const [selectedKPI, setSelectedKPI] = useState<{
    type: string;
    title: string;
    status: KPIStatus;
  } | null>(null);

  const handleKPIClick = (kpiName: string, title: string, status: KPIStatus) => {
    console.log(`Drill-down für ${kpiName} requested`);
    setSelectedKPI({ type: kpiName, title, status });
  };

  const handleCloseModal = () => {
    setSelectedKPI(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Haupt-KPIs */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Kern-KPIs (Executive Level)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Logistikkosten"
              value={kpiData.logistikkosten.current}
              unit="% vom Umsatz"
              trend={kpiData.logistikkosten.trend}
              status={kpiData.logistikkosten.status}
              icon={Euro}
              target={kpiData.logistikkosten.target}
              onClick={() => handleKPIClick('logistikkosten', 'Logistikkosten', kpiData.logistikkosten.status)}
            />
            
            <KPICard
              title="Termintreue"
              value={kpiData.termintreue.current}
              unit="%"
              trend={kpiData.termintreue.trend}
              status={kpiData.termintreue.status}
              icon={Clock}
              target={kpiData.termintreue.target}
              onClick={() => handleKPIClick('termintreue', 'Termintreue', kpiData.termintreue.status)}
            />
            
            <KPICard
              title="Lagerumschlag"
              value={kpiData.lagerumschlag.current}
              unit="x/Jahr"
              trend={kpiData.lagerumschlag.trend}
              status={kpiData.lagerumschlag.status}
              icon={RotateCcw}
              target={kpiData.lagerumschlag.target}
              onClick={() => handleKPIClick('lagerumschlag', 'Lagerumschlag', kpiData.lagerumschlag.status)}
            />
            
            <KPICard
              title="C2C-Zyklus"
              value={kpiData.c2cZyklus.current}
              unit="Tage"
              trend={kpiData.c2cZyklus.trend}
              status={kpiData.c2cZyklus.status}
              icon={TrendingUp}
              target={kpiData.c2cZyklus.target}
              onClick={() => handleKPIClick('c2c', 'C2C-Zyklus', kpiData.c2cZyklus.status)}
            />
          </div>
        </div>

        {/* Schnellübersicht */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Tagesübersicht
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <KPICard
                key={index}
                title={stat.label}
                value={stat.value}
                status={stat.status}
                icon={stat.icon}
                onClick={() => handleKPIClick(stat.label.toLowerCase(), stat.label, stat.status)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* KPI Detail Modal */}
      {selectedKPI && (
        <KPIDetailModal
          isOpen={true}
          onClose={handleCloseModal}
          kpiType={selectedKPI.type}
          title={selectedKPI.title}
          status={selectedKPI.status}
        />
      )}
    </>
  );
}