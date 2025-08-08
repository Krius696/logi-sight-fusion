import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  headerActions?: ReactNode;
}

export function DashboardLayout({ children, headerActions }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-dashboard-bg">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Logistik Control Tower
            </h1>
            <p className="text-sm text-muted-foreground">
              Live-Dashboard für Supply Chain Management
            </p>
          </div>
          <div className="flex items-center gap-3">
            {headerActions ? <div className="flex items-center">{headerActions}</div> : null}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-status-excellent rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
              <span>•</span>
              <span>Letzte Aktualisierung: {new Date().toLocaleTimeString('de-DE')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}