'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Users, Package, FileText, FlaskConical } from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent } from '@/components/ui/card';
import { PageSkeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/lib/api/admin';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const token = session?.user.accessToken ?? '';

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => adminApi.analytics(token),
    enabled: !!token,
  });

  if (isLoading && !metrics) return <PageSkeleton />;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Platform management and oversight</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={metrics?.totalUsers ?? 0}
          icon={Users}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Total Scans"
          value={metrics?.totalScans ?? 0}
          icon={LayoutDashboard}
          iconColor="text-primary"
        />
        <StatCard
          title="Reports"
          value={metrics?.totalReports ?? 0}
          icon={FileText}
          iconColor="text-emerald-500"
        />
        <StatCard
          title="AI Accuracy"
          value={`${Math.round((metrics?.averageConfidence ?? 0) * 100)}%`}
          icon={FlaskConical}
          iconColor="text-purple-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            href: '/admin/users',
            label: 'Manage Users',
            icon: Users,
            desc: 'User accounts and roles',
          },
          {
            href: '/admin/batches',
            label: 'Manage Batches',
            icon: Package,
            desc: 'Batch scan management',
          },
          {
            href: '/admin/reports',
            label: 'Reports',
            icon: FileText,
            desc: 'View and manage reports',
          },
          {
            href: '/admin/lab',
            label: 'Lab Validations',
            icon: FlaskConical,
            desc: 'Validation oversight',
          },
          {
            href: '/analytics',
            label: 'Analytics',
            icon: LayoutDashboard,
            desc: 'Platform analytics',
          },
        ].map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={href}>
            <Card className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
