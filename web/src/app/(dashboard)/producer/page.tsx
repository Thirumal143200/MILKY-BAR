'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { ScanLine, Upload, FileText, Package, TrendingUp, CheckCircle2 } from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

export default function ProducerDashboard() {
  const { data: session } = useSession();
  const token = session?.user.accessToken ?? '';

  const { data: scansData, isLoading } = useQuery({
    queryKey: ['producer-scans'],
    queryFn: () => scansApi.list(token, { limit: 10 }),
    enabled: !!token,
  });

  if (isLoading && !scansData) return <PageSkeleton />;

  const scans = scansData?.data ?? [];
  const completed = scans.filter((s) => s.status === 'completed').length;
  const failed = scans.filter((s) => s.status === 'failed').length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Welcome, {session?.user.firstName}!</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage your milk quality scans and reports
          </p>
        </div>
        <Link href="/producer/upload">
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            New Scan
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Scans"
          value={scansData?.meta.total ?? 0}
          icon={ScanLine}
          iconColor="text-primary"
        />
        <StatCard
          title="Completed"
          value={completed}
          icon={CheckCircle2}
          iconColor="text-emerald-500"
          changeType="positive"
        />
        <StatCard
          title="Failed"
          value={failed}
          icon={TrendingUp}
          iconColor="text-red-500"
          changeType={failed > 0 ? 'negative' : 'neutral'}
        />
        <StatCard title="Reports" value={completed} icon={FileText} iconColor="text-blue-500" />
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/producer/upload">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Upload Scan</p>
                <p className="text-xs text-muted-foreground">Single or batch</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/producer/reports">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-sm">My Reports</p>
                <p className="text-xs text-muted-foreground">View & download</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/producer/batches">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="font-medium text-sm">Batch Upload</p>
                <p className="text-xs text-muted-foreground">Multiple samples</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent scans */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Scans</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {scans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ScanLine className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No scans yet. Upload your first sample!</p>
              <Link href="/producer/upload">
                <Button className="mt-4" size="sm">
                  Upload Now
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {scans.map((scan) => (
                <Link key={scan.id} href={`/producer/scans/${scan.id}`}>
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
