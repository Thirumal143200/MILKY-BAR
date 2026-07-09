import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        success: 'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        warning: 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400',
        info: 'border-transparent bg-blue-500/15 text-blue-600 dark:text-blue-400',
        // Quality labels
        excellent: 'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        good: 'border-transparent bg-blue-500/15 text-blue-600 dark:text-blue-400',
        acceptable: 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400',
        poor: 'border-transparent bg-orange-500/15 text-orange-600 dark:text-orange-400',
        adulterated: 'border-transparent bg-red-500/15 text-red-600 dark:text-red-400',
        spoiled: 'border-transparent bg-rose-700/15 text-rose-700 dark:text-rose-400',
        inconclusive: 'border-transparent bg-gray-500/15 text-gray-600 dark:text-gray-400',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
