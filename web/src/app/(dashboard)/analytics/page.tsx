'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/lib/api/admin';
import { formatDate } from '@/lib/utils';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const token = session?.user.accessToken ?? '';

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => adminApi.analytics(token),
    enabled: !!token,
  });

  const exportCsv = () => {
    const rows = [
      ['Date', 'Scans'],
      ...(metrics?.recentActivity ?? []).map((r) => [r.date, String(r.scans)]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `milkboy-analytics-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (isLoading && !metrics) return <PageSkeleton />;

  const qualityData = Object.entries(metrics?.scansByQuality ?? {}).map(([label, value]) => ({
    name: label,
    value,
  }));
  const activityData = metrics?.recentActivity ?? [];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Platform-wide quality trends and scan statistics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={exportCsv}>
            <Download className="h-3.5 w-3.5" />
            CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="h-3.5 w-3.5" />
            PDF
          </Button>
        </div>
      </div>

      {/* Activity trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Daily Scan Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tickFormatter={(v: string) => formatDate(v, 'MMM d')}
                tick={{ fontSize: 11 }}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelFormatter={(v) => formatDate(v as string, 'MMMM dd, yyyy')}
              />
              <Area
                type="monotone"
                dataKey="scans"
                stroke="hsl(38 92% 50%)"
                strokeWidth={2}
                fill="url(#areaGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quality breakdown bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quality Label Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={qualityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {qualityData.map((entry, index) => (
                    <Cell key={index} fill={QUALITY_COLORS[entry.name] ?? '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quality pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quality Share</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={qualityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {qualityData.map((entry, index) => (
                    <Cell key={index} fill={QUALITY_COLORS[entry.name] ?? '#6b7280'} />
                  ))}
                </Pie>
                <Legend
                  formatter={(v) => <span className="text-xs capitalize">{v as string}</span>}
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
    </div>
  );
}
