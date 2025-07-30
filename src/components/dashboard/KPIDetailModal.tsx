import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { KPIStatus } from "./KPICard";

interface KPIDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpiType: string;
  title: string;
  status: KPIStatus;
}

// Mock-Daten für historische Trends (letzte 8 Wochen)
const generateWeeklyData = (kpiType: string) => {
  const weeks = [];
  const currentDate = new Date();
  
  for (let i = 7; i >= 0; i--) {
    const weekDate = new Date(currentDate);
    weekDate.setDate(weekDate.getDate() - (i * 7));
    const weekLabel = `KW ${Math.ceil((weekDate.getDate()) / 7)}`;
    
    let data: any = {
      week: weekLabel,
      date: weekDate.toISOString().split('T')[0]
    };
    
    switch (kpiType) {
      case 'logistikkosten':
        data = {
          ...data,
          value: +(7.8 - (i * 0.1) + Math.random() * 0.3).toFixed(1),
          target: 7.0,
          budget: +(8.2 - (i * 0.05)).toFixed(1)
        };
        break;
      case 'termintreue':
        data = {
          ...data,
          value: +(94 + (i * 0.4) + Math.random() * 2).toFixed(1),
          target: 97.0,
          benchmark: 95.0
        };
        break;
      case 'lagerumschlag':
        data = {
          ...data,
          value: +(11.2 + (i * 0.15) + Math.random() * 0.8).toFixed(1),
          target: 12.0,
          lastYear: +(10.8 + (i * 0.1)).toFixed(1)
        };
        break;
      case 'c2c':
        data = {
          ...data,
          value: Math.floor(32 - (i * 0.5) + Math.random() * 3),
          target: 25,
          industry: 30
        };
        break;
      default:
        data = {
          ...data,
          value: Math.floor(Math.random() * 100),
          target: 80
        };
    }
    
    weeks.push(data);
  }
  
  return weeks;
};

const chartConfigs: Record<string, any> = {
  logistikkosten: {
    title: "Logistikkosten Entwicklung",
    description: "Logistikkosten in % vom Umsatz über die letzten 8 Wochen",
    yAxisLabel: "% vom Umsatz",
    chartConfig: {
      value: {
        label: "Ist-Kosten",
        color: "hsl(var(--chart-primary))"
      },
      target: {
        label: "Ziel",
        color: "hsl(var(--status-excellent))"
      },
      budget: {
        label: "Budget",
        color: "hsl(var(--status-warning))"
      }
    }
  },
  termintreue: {
    title: "Termintreue Entwicklung", 
    description: "Termintreue in % über die letzten 8 Wochen",
    yAxisLabel: "Termintreue %",
    chartConfig: {
      value: {
        label: "Ist-Wert",
        color: "hsl(var(--chart-primary))"
      },
      target: {
        label: "Ziel",
        color: "hsl(var(--status-excellent))"
      },
      benchmark: {
        label: "Branchenschnitt",
        color: "hsl(var(--status-good))"
      }
    }
  },
  lagerumschlag: {
    title: "Lagerumschlag Entwicklung",
    description: "Lagerumschlag pro Jahr über die letzten 8 Wochen", 
    yAxisLabel: "Umschläge/Jahr",
    chartConfig: {
      value: {
        label: "Ist-Wert",
        color: "hsl(var(--chart-primary))"
      },
      target: {
        label: "Ziel",
        color: "hsl(var(--status-excellent))"
      },
      lastYear: {
        label: "Vorjahr",
        color: "hsl(var(--chart-secondary))"
      }
    }
  },
  c2c: {
    title: "Cash-to-Cash Zyklus",
    description: "C2C-Zyklus in Tagen über die letzten 8 Wochen",
    yAxisLabel: "Tage", 
    chartConfig: {
      value: {
        label: "Ist-Wert",
        color: "hsl(var(--chart-primary))"
      },
      target: {
        label: "Ziel",
        color: "hsl(var(--status-excellent))"
      },
      industry: {
        label: "Branchenschnitt",
        color: "hsl(var(--status-good))"
      }
    }
  }
};

export function KPIDetailModal({ isOpen, onClose, kpiType, title, status }: KPIDetailModalProps) {
  const data = generateWeeklyData(kpiType);
  const config = chartConfigs[kpiType] || chartConfigs.logistikkosten;
  
  const statusColor = {
    excellent: "bg-status-excellent/20 text-status-excellent",
    good: "bg-status-good/20 text-status-good", 
    warning: "bg-status-warning/20 text-status-warning",
    critical: "bg-status-critical/20 text-status-critical"
  }[status];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl">{config.title}</DialogTitle>
            <Badge className={statusColor}>
              {status === 'excellent' ? 'Ausgezeichnet' : 
               status === 'good' ? 'Gut' :
               status === 'warning' ? 'Warnung' : 'Kritisch'}
            </Badge>
          </div>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Trend Chart */}
          <div className="h-80">
            <ChartContainer config={config.chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="week" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: config.yAxisLabel, angle: -90, position: 'insideLeft' }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  
                  {/* Ziel-Linie */}
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="var(--color-target)"
                    strokeDasharray="5 5"
                    dot={false}
                    strokeWidth={2}
                  />
                  
                  {/* Vergleichslinie (je nach KPI) */}
                  {data[0].budget && (
                    <Line
                      type="monotone"
                      dataKey="budget"
                      stroke="var(--color-budget)"
                      strokeDasharray="3 3"
                      dot={false}
                      strokeWidth={1}
                    />
                  )}
                  {data[0].benchmark && (
                    <Line
                      type="monotone"
                      dataKey="benchmark"
                      stroke="var(--color-benchmark)"
                      strokeDasharray="3 3"
                      dot={false}
                      strokeWidth={1}
                    />
                  )}
                  {data[0].lastYear && (
                    <Line
                      type="monotone"
                      dataKey="lastYear"
                      stroke="var(--color-lastYear)"
                      strokeDasharray="2 2"
                      dot={false}
                      strokeWidth={1}
                    />
                  )}
                  {data[0].industry && (
                    <Line
                      type="monotone"
                      dataKey="industry"
                      stroke="var(--color-industry)"
                      strokeDasharray="3 3"
                      dot={false}
                      strokeWidth={1}
                    />
                  )}
                  
                  {/* Hauptlinie - Ist-Werte */}
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-value)", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Statistiken */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {kpiType === 'logistikkosten' ? 
                  `${data[data.length - 1].value}%` :
                  kpiType === 'termintreue' ?
                  `${data[data.length - 1].value}%` :
                  kpiType === 'c2c' ?
                  `${data[data.length - 1].value} Tage` :
                  `${data[data.length - 1].value}x`
                }
              </div>
              <div className="text-sm text-muted-foreground">Aktueller Wert</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-status-excellent">
                {((data[data.length - 1].value - data[0].value) / data[0].value * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">8-Wochen Trend</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chart-secondary">
                {kpiType === 'logistikkosten' ? `${data[0].target}%` :
                 kpiType === 'termintreue' ? `${data[0].target}%` :
                 kpiType === 'c2c' ? `${data[0].target} Tage` :
                 `${data[0].target}x`}
              </div>
              <div className="text-sm text-muted-foreground">Zielwert</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}