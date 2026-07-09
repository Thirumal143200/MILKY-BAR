import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';
import { QualityBadge } from '@/components/shared/quality-badge';
import { StatCard } from '@/components/shared/stat-card';
import { Users } from 'lucide-react';

describe('Badge component', () => {
  it('renders with default variant', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('renders with success variant', () => {
    render(<Badge variant="success">Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});

describe('QualityBadge component', () => {
  it('renders excellent label', () => {
    render(<QualityBadge label="excellent" />);
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('renders adulterated label', () => {
    render(<QualityBadge label="adulterated" />);
    expect(screen.getByText('Adulterated')).toBeInTheDocument();
  });
});

describe('StatCard component', () => {
  it('renders title and value', () => {
    render(<StatCard title="Total Scans" value="1,234" icon={Users} />);
    expect(screen.getByText('Total Scans')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders change text when provided', () => {
    render(
      <StatCard
        title="Users"
        value="500"
        icon={Users}
        change="+10% this month"
        changeType="positive"
      />,
    );
    expect(screen.getByText('+10% this month')).toBeInTheDocument();
  });
});
