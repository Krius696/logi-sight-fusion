import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Fuel, Truck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const CostAnalysis = () => {
  const monthlyData = [
    { month: 'Jan', transport: 45000, fuel: 12000, personal: 28000, wartung: 8000 },
    { month: 'Feb', transport: 52000, fuel: 14000, personal: 29000, wartung: 6000 },
    { month: 'Mär', transport: 48000, fuel: 13500, personal: 28500, wartung: 9500 },
    { month: 'Apr', transport: 55000, fuel: 15000, personal: 30000, wartung: 7000 },
    { month: 'Mai', transport: 58000, fuel: 16000, personal: 31000, wartung: 8500 },
    { month: 'Jun', transport: 62000, fuel: 17500, personal: 32000, wartung: 10000 }
  ];

  const costBreakdown = [
    { name: 'Transport', value: 62000, color: 'hsl(var(--chart-1))' },
    { name: 'Kraftstoff', value: 17500, color: 'hsl(var(--chart-2))' },
    { name: 'Personal', value: 32000, color: 'hsl(var(--chart-3))' },
    { name: 'Wartung', value: 10000, color: 'hsl(var(--chart-4))' }
  ];

  const kpis = [
    {
      title: "Gesamtkosten",
      value: "€121.500",
      change: "+8.2%",
      trend: "up",
      icon: DollarSign,
      description: "vs. Vormonat"
    },
    {
      title: "Kraftstoffkosten",
      value: "€17.500", 
      change: "-2.1%",
      trend: "down",
      icon: Fuel,
      description: "Effizienz verbessert"
    },
    {
      title: "Kosten pro KM",
      value: "€1.42",
      change: "+0.3%",
      trend: "up", 
      icon: Truck,
      description: "Durchschnitt"
    },
    {
      title: "Personalkosten",
      value: "€32.000",
      change: "+3.2%",
      trend: "up",
      icon: Users,
      description: "Überstunden"
    }
  ];

  return (
    <DashboardLayout>
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
        </div>

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
              <CardTitle>Monatliche Kostenentwicklung</CardTitle>
              <CardDescription>Kostenverteilung über die letzten 6 Monate</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`€${value.toLocaleString()}`, '']}
                    labelFormatter={(label) => `Monat: ${label}`}
                  />
                  <Bar dataKey="transport" stackId="a" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="fuel" stackId="a" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="personal" stackId="a" fill="hsl(var(--chart-3))" />
                  <Bar dataKey="wartung" stackId="a" fill="hsl(var(--chart-4))" />
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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `€${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Kostendetails */}
        <Card>
          <CardHeader>
            <CardTitle>Detaillierte Kostenaufstellung</CardTitle>
            <CardDescription>Aufschlüsselung nach Kostenkategorien</CardDescription>
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
                        {((category.value / costBreakdown.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}% der Gesamtkosten
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">€{category.value.toLocaleString()}</p>
                    <Badge variant="outline" className="text-xs">
                      {category.name === 'Kraftstoff' ? '-2.1%' : '+3.2%'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CostAnalysis;