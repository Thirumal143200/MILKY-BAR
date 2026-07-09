'use client';

import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-primary',
  description,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('animate-fade-in', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold font-display">{value}</p>
          </div>
          <div
            className={cn(
              'rounded-xl p-2.5 bg-primary/10',
              iconColor.replace('text-', 'bg-').replace('primary', 'primary') + '/10',
            )}
          >
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
        </div>
        {(change ?? description) && (
          <div className="mt-4 flex items-center gap-1">
            {change && (
              <span
                className={cn(
                  'text-xs font-medium',
                  changeType === 'positive' && 'text-emerald-500',
                  changeType === 'negative' && 'text-red-500',
                  changeType === 'neutral' && 'text-muted-foreground',
                )}
              >
                {change}
              </span>
            )}
            {description && <span className="text-xs text-muted-foreground">{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
