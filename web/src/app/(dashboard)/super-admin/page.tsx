'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  ScanLine,
  Activity,
  ShieldCheck,
  TrendingUp,
  Database,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import { PageSkeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { formatDate } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const QUALITY_COLORS: Record<string, string> = {
  excellent: '#10b981',
  good: '#3b82f6',
  acceptable: '#f59e0b',
  poor: '#f97316',
  adulterated: '#ef4444',
  spoiled: '#dc2626',
  inconclusive: '#6b7280',
};

export default function SuperAdminPage() {
  const { data: session } = useSession();
  const token = session?.user.accessToken ?? '';

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.analytics(token),
    enabled: !!token,
    refetchInterval: 30000,
  });

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => adminApi.systemHealth(token),
    enabled: !!token,
    refetchInterval: 15000,
  });

  if (metricsLoading && !metrics) return <PageSkeleton />;

  const qualityPieData = Object.entries(metrics?.scansByQuality ?? {}).map(([label, value]) => ({
    name: label,
    value,
  }));

  const activityData = metrics?.recentActivity ?? [];

  const heapPct = health?.memory
    ? Math.round((health.memory.heapUsed / health.memory.heapTotal) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-display font-bold">System Overview</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Real-time platform health, analytics, and system status
        </p>
      </div>

      {/* System health banner */}
      {health && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-5 py-3 ${
            health.status === 'healthy'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400'
          }`}
        >
          {health.status === 'healthy' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            System {health.status} · DB: {health.database} · Storage: {health.storage} · Uptime:{' '}
            {Math.round(health.uptime / 3600)}h · Memory: {heapPct}%
          </span>
          {!healthLoading && (
            <span className="ml-auto text-xs opacity-60">
              <Clock className="inline h-3 w-3 mr-1" />
              Updated just now
            </span>
          )}
        </div>
      )}

      {/* KPI stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={metrics?.totalUsers?.toLocaleString() ?? '—'}
          icon={Users}
          iconColor="text-blue-500"
          change="+12% this month"
          changeType="positive"
        />
        <StatCard
          title="Total Scans"
          value={metrics?.totalScans?.toLocaleString() ?? '—'}
          icon={ScanLine}
          iconColor="text-primary"
          change="+8% this week"
          changeType="positive"
        />
        <StatCard
          title="AI Accuracy"
          value={`${Math.round((metrics?.averageConfidence ?? 0) * 100)}%`}
          icon={Cpu}
          iconColor="text-purple-500"
          description="average confidence"
        />
        <StatCard
          title="Reports Generated"
          value={metrics?.totalReports?.toLocaleString() ?? '—'}
          icon={Activity}
          iconColor="text-emerald-500"
          change="Total all-time"
          changeType="neutral"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Scan activity chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Scan Activity (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v: string) => formatDate(v, 'MMM d')}
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 11 }}
                />
                <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelFormatter={(v) => formatDate(v as string, 'MMM dd, yyyy')}
                />
                <Area
                  type="monotone"
                  dataKey="scans"
                  stroke="hsl(38 92% 50%)"
                  strokeWidth={2}
                  fill="url(#scanGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quality breakdown pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Quality Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={qualityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {qualityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={QUALITY_COLORS[entry.name] ?? '#6b7280'} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => (
                    <span className="text-xs capitalize">{value as string}</span>
                  )}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Scan status breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Scan Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(metrics?.scansByStatus ?? {}).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2 rounded-lg border px-4 py-2">
                <span className="text-sm font-medium capitalize">{status}</span>
                <Badge variant="secondary">{String(count)}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
