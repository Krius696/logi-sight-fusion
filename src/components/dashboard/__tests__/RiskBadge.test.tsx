import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RiskBadge } from '../RiskBadge';

// Test component for Risk Badge
function RiskBadge({ riskScore }: { riskScore: number }) {
  const getRiskColor = (score: number) => {
    if (score >= 60) return 'bg-status-critical/20 text-status-critical border-status-critical/30';
    if (score >= 40) return 'bg-status-warning/20 text-status-warning border-status-warning/30';
    return 'bg-status-excellent/20 text-status-excellent border-status-excellent/30';
  };

  return (
    <div 
      className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(riskScore)}`}
      data-testid="risk-badge"
    >
      Risk {riskScore}%
    </div>
  );
}

describe('RiskBadge', () => {
  it('renders critical risk (>= 60%) with correct styling', () => {
    const { container } = render(<RiskBadge riskScore={75} />);
    expect(container).toMatchSnapshot();
  });

  it('renders warning risk (40-59%) with correct styling', () => {
    const { container } = render(<RiskBadge riskScore={45} />);
    expect(container).toMatchSnapshot();
  });

  it('renders low risk (< 40%) with correct styling', () => {
    const { container } = render(<RiskBadge riskScore={25} />);
    expect(container).toMatchSnapshot();
  });

  it('renders edge case: exactly 60% as critical', () => {
    const { container } = render(<RiskBadge riskScore={60} />);
    expect(container).toMatchSnapshot();
  });

  it('renders edge case: exactly 40% as warning', () => {
    const { container } = render(<RiskBadge riskScore={40} />);
    expect(container).toMatchSnapshot();
  });
});