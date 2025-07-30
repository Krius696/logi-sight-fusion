import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type KPIStatus = 'excellent' | 'good' | 'warning' | 'critical';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  status: KPIStatus;
  icon: LucideIcon;
  target?: string | number;
  onClick?: () => void;
}

const statusConfig = {
  excellent: {
    color: 'text-status-excellent',
    bgColor: 'bg-status-excellent/10',
    borderColor: 'border-status-excellent/20'
  },
  good: {
    color: 'text-status-good',
    bgColor: 'bg-status-good/10',
    borderColor: 'border-status-good/20'
  },
  warning: {
    color: 'text-status-warning',
    bgColor: 'bg-status-warning/10',
    borderColor: 'border-status-warning/20'
  },
  critical: {
    color: 'text-status-critical',
    bgColor: 'bg-status-critical/10',
    borderColor: 'border-status-critical/20'
  }
};

export function KPICard({ 
  title, 
  value, 
  unit, 
  trend, 
  status, 
  icon: Icon, 
  target, 
  onClick 
}: KPICardProps) {
  const config = statusConfig[status];

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg",
        "border-2",
        config.borderColor,
        onClick && "hover:ring-2 hover:ring-primary/20"
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-lg", config.bgColor)}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold text-foreground">
            {value}
          </div>
          {unit && (
            <div className="text-sm text-muted-foreground">
              {unit}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2">
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              trend.isPositive ? "text-status-excellent" : "text-status-critical"
            )}>
              <span>{trend.isPositive ? "↗" : "↘"}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground">vs. Vorwoche</span>
            </div>
          )}
          
          {target && (
            <div className="text-xs text-muted-foreground">
              Ziel: {target}{unit}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}