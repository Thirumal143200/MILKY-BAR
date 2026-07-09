'use client';

import { Badge } from '@/components/ui/badge';
import { type QualityLabel } from '@milkboy/shared';
import { snakeToTitle } from '@/lib/utils';

const QUALITY_VARIANTS: Record<QualityLabel, string> = {
  excellent: 'excellent',
  good: 'good',
  acceptable: 'acceptable',
  poor: 'poor',
  adulterated: 'adulterated',
  spoiled: 'spoiled',
  inconclusive: 'inconclusive',
};

interface QualityBadgeProps {
  label: QualityLabel;
  showDot?: boolean;
}

export function QualityBadge({ label, showDot = false }: QualityBadgeProps) {
  const variant = QUALITY_VARIANTS[label] as
    'excellent' | 'good' | 'acceptable' | 'poor' | 'adulterated' | 'spoiled' | 'inconclusive';

  return (
    <Badge variant={variant} className="gap-1.5 capitalize">
      {showDot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {snakeToTitle(label)}
    </Badge>
  );
}

/** Confidence bar for AI predictions */
export function ConfidenceBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">Confidence</span>
        <span className="text-xs font-semibold">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
