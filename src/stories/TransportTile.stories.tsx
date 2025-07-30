import type { Meta, StoryObj } from '@storybook/react';
import { TransportTile } from './TransportTile';

// Transport tile component for Storybook
function TransportTile({ transport, onClick }: { transport: any; onClick?: () => void }) {
  const statusConfig = {
    'pünktlich': {
      color: 'text-status-excellent',
      bgColor: 'bg-status-excellent/10',
      borderColor: 'border-status-excellent/30',
    },
    'verspätet': {
      color: 'text-status-warning',
      bgColor: 'bg-status-warning/10', 
      borderColor: 'border-status-warning/30',
    },
    'kritisch': {
      color: 'text-status-critical',
      bgColor: 'bg-status-critical/10',
      borderColor: 'border-status-critical/30',
    },
    'angekommen': {
      color: 'text-status-excellent',
      bgColor: 'bg-status-excellent/10',
      borderColor: 'border-status-excellent/30',
    }
  };

  const config = statusConfig[transport.status];

  return (
    <div
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md max-w-md ${config.bgColor} ${config.borderColor}`}
      onClick={onClick}
      data-testid="transport-tile"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{transport.auftragsNr}</span>
          <span 
            className={`px-2 py-1 rounded text-xs font-medium ${config.bgColor} ${config.color}`}
          >
            {transport.status.toUpperCase()}
          </span>
          
          {transport.riskScore !== undefined && (
            <div 
              className={`px-2 py-1 rounded-full text-xs font-medium border ${
                transport.riskScore >= 60 
                  ? "bg-status-critical/20 text-status-critical border-status-critical/30" 
                  : transport.riskScore >= 40
                    ? "bg-status-warning/20 text-status-warning border-status-warning/30"
                    : "bg-status-excellent/20 text-status-excellent border-status-excellent/30"
              }`}
              data-testid="risk-badge"
            >
              Risk {transport.riskScore}%
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">Route</div>
            <div className="font-medium text-xs">
              {transport.route.from} → {transport.route.to}
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground text-xs">ETA</div>
            <div className="flex items-center gap-1">
              <span className="font-medium text-xs">{transport.eta}</span>
              {transport.delay > 15 && (
                <span className="text-status-critical text-xs">
                  +{transport.delay}min
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Fortschritt</span>
            <span>{transport.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                transport.status === 'kritisch' ? "bg-status-critical" :
                transport.status === 'verspätet' ? "bg-status-warning" :
                "bg-status-excellent"
              }`}
              style={{ width: `${transport.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const meta: Meta<typeof TransportTile> = {
  title: 'Dashboard/TransportTile',
  component: TransportTile,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Transport tile component showing real-time transport status with risk scoring and progress tracking.'
      }
    }
  },
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Pünktlich: Story = {
  args: {
    transport: {
      id: 'T-002',
      auftragsNr: 'SO-8833',
      route: { from: 'Berlin', to: 'Stuttgart' },
      status: 'pünktlich',
      eta: '16:20',
      planEta: '16:30',
      delay: -10,
      cargo: 'Maschinenbauteile (4.8t)',
      driver: 'A. Weber',
      progress: 45,
      riskScore: 25
    }
  }
};

export const Verspätet: Story = {
  args: {
    transport: {
      id: 'T-001',
      auftragsNr: 'SO-8832',
      route: { from: 'München', to: 'Hamburg' },
      status: 'verspätet',
      eta: '14:45',
      planEta: '14:00',
      delay: 45,
      cargo: 'Elektronikteile (2.4t)',
      driver: 'M. Schmidt',
      progress: 65,
      riskScore: 72
    }
  }
};

export const KritischHighRisk: Story = {
  args: {
    transport: {
      id: 'T-003',
      auftragsNr: 'SO-8834',
      route: { from: 'Köln', to: 'Dresden' },
      status: 'kritisch',
      eta: '18:15',
      planEta: '17:00',
      delay: 75,
      position: { lat: 50.9, lng: 6.9, address: 'A1 Stau bei Köln' },
      cargo: 'Chemikalien (3.2t)',
      driver: 'P. Müller',
      progress: 20,
      riskScore: 89
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Critical transport with high risk score (89%). Shows red status indicator, high delay, and critical risk badge. This scenario requires immediate attention and AI-powered mitigation analysis.'
      }
    }
  }
};

export const Angekommen: Story = {
  args: {
    transport: {
      id: 'T-004',
      auftragsNr: 'SO-8835',
      route: { from: 'Frankfurt', to: 'Nürnberg' },
      status: 'angekommen',
      eta: '12:30',
      planEta: '12:45',
      delay: -15,
      cargo: 'Automotive Teile (5.1t)',
      driver: 'S. Fischer',
      progress: 100,
      riskScore: 5
    }
  }
};

export const LowRisk: Story = {
  args: {
    transport: {
      id: 'T-005',
      auftragsNr: 'SO-8836',
      route: { from: 'Düsseldorf', to: 'Leipzig' },
      status: 'pünktlich',
      eta: '15:30',
      planEta: '15:30',
      delay: 0,
      cargo: 'Textilien (1.8t)',
      driver: 'L. Becker',
      progress: 30,
      riskScore: 15
    }
  }
};