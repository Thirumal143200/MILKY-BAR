'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { ScanLine, FileText, ShieldCheck } from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/ui/skeleton';
import { scansApi } from '@/lib/api/scans';
import { formatRelative } from '@/lib/utils';
import Link from 'next/link';
import type { ScanStatus } from '@milkboy/shared';

const STATUS_VARIANT: Record<
  ScanStatus,
  'success' | 'warning' | 'destructive' | 'secondary' | 'info'
> = {
  completed: 'success',
  analyzing: 'info',
  preprocessing: 'info',
  uploading: 'info',
  created: 'secondary',
  failed: 'destructive',
  rejected: 'destructive',
};

export default function ConsumerDashboard() {
  const { data: session } = useSession();
  const token = session?.user.accessToken ?? '';

  const { data: scansData, isLoading } = useQuery({
    queryKey: ['consumer-scans'],
    queryFn: () => scansApi.list(token, { limit: 10 }),
    enabled: !!token,
  });

  if (isLoading && !scansData) return <PageSkeleton />;

  const scans = scansData?.data ?? [];
  const completed = scans.filter((s) => s.status === 'completed').length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold">Hello, {session?.user.firstName}!</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Your milk quality scan history and reports
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Scans"
          value={scansData?.meta.total ?? 0}
          icon={ScanLine}
          iconColor="text-primary"
        />
        <StatCard
          title="Completed"
          value={completed}
          icon={FileText}
          iconColor="text-emerald-500"
        />
        <StatCard title="Reports" value={completed} icon={ShieldCheck} iconColor="text-blue-500" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scan History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {scans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ScanLine className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No scans found in your account.</p>
            </div>
          ) : (
            <div className="divide-y">
              {scans.map((scan) => (
                <Link key={scan.id} href={`/consumer/scans/${scan.id}`}>
                  <div className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {scan.title ?? `Scan #${scan.id.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {scan.imageCount} image{scan.imageCount !== 1 ? 's' : ''} ·{' '}
                        {formatRelative(scan.createdAt)}
                      </p>
                    </div>
                    <Badge variant={STATUS_VARIANT[scan.status]}>{scan.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
