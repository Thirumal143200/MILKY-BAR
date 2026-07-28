'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Server, Database, HardDrive, Cpu, Clock } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api/admin';

export default function SystemMonitoringPage() {
  const { data: session } = useSession();
  const token = session?.user.accessToken ?? '';

  const { data: monitoring, isLoading } = useQuery({
    queryKey: ['admin-system-monitoring'],
    queryFn: () => adminApi.systemMonitoring(token),
    enabled: !!token,
    refetchInterval: 10000,
  });

  const { data: dbStatus } = useQuery({
    queryKey: ['admin-db-status'],
    queryFn: () => adminApi.databaseStatus(token),
    enabled: !!token,
    refetchInterval: 30000,
  });

  if (isLoading && !monitoring) return <PageSkeleton />;

  const mem = (monitoring?.memory as Record<string, unknown>) || {
    rssMb: 0,
    heapTotalMb: 0,
    heapUsedMb: 0,
  };
  const uptime = Number(monitoring?.uptimeSeconds ?? 0);
  const uptimeHours = (uptime / 3600).toFixed(1);
  const activeSessions = Number(monitoring?.activeSessionsCount ?? 0);
  const tables = (dbStatus?.tables as Record<string, number>) || {};

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          System Health & Resource Monitoring
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Live process memory usage, active sessions, database table sizes, and node runtime
          diagnostics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{uptimeHours} hours</div>
            <p className="text-xs text-muted-foreground mt-1">Process runtime</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Memory Heap Used
            </CardTitle>
            <Cpu className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{String(mem.heapUsedMb ?? 0)} MB</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total Heap: {String(mem.heapTotalMb ?? 0)} MB
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Sessions
            </CardTitle>
            <Server className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{activeSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">Unexpired tokens</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Database Engine
            </CardTitle>
            <Database className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display capitalize">
              {String(dbStatus?.client || 'SQLite')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Environment: {String(monitoring?.environment || 'development')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Database Table Row Counts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-primary" />
            Database Table Record Counts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {Object.entries(tables).map(([table, count]) => (
              <div key={table} className="p-3 border rounded-lg bg-muted/20">
                <span className="text-xs text-muted-foreground block font-mono">{table}</span>
                <span className="text-lg font-bold font-display">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
