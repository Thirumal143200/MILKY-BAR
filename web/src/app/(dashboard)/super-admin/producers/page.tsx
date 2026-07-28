'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { Tractor, Users, PackageCheck, AlertCircle } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';

export default function ProducersPage() {
  const { data: session } = useSession();
  const token = session?.user.accessToken ?? '';

  const { data: producerStats, isLoading } = useQuery({
    queryKey: ['admin-producers-analytics'],
    queryFn: () => adminApi.producersAnalytics(token),
    enabled: !!token,
  });

  if (isLoading && !producerStats) return <PageSkeleton />;

  const producers = (producerStats?.producersList as any[]) || [];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Tractor className="h-6 w-6 text-primary" />
          Producer Management & Milk Collections
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Registered milk producers, total volume batches collected, and individual producer compliance status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Producers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{Number(producerStats?.totalProducers ?? 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered dairy farmers</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Producers</CardTitle>
            <Tractor className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{Number(producerStats?.activeProducers ?? 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Active status</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Milk Collections</CardTitle>
            <PackageCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{Number(producerStats?.totalCollections ?? 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Recorded scans</p>
          </CardContent>
        </Card>
      </div>

      {/* Producers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registered Milk Producers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b bg-muted/30">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Registered Date</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {producers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="h-24 text-center text-muted-foreground">
                      No producers registered yet.
                    </td>
                  </tr>
                ) : (
                  producers.map((p) => (
                    <tr key={p.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 font-medium">{p.name}</td>
                      <td className="p-4 font-mono text-xs">{p.email}</td>
                      <td className="p-4">
                        <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
