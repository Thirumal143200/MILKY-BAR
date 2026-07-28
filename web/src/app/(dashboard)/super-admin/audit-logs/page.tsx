'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ShieldCheck, Search, Download } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';

export default function AuditLogsPage() {
  const { data: session } = useSession();
  const token = session?.user.accessToken ?? '';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', page, search],
    queryFn: () =>
      adminApi.auditLogs(token, {
        page,
        limit: 25,
        search: search || undefined,
      }),
    enabled: !!token,
  });

  if (isLoading && !data) return <PageSkeleton />;

  const logs = data?.data || [];

  const exportJSON = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Security & Audit Logs
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Immutable audit record of all administrative operations, authentication events, and scan
            activities
          </p>
        </div>

        <Button onClick={exportJSON} variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export JSON
        </Button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by action, resource, or user..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b bg-muted/30">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Timestamp
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Action
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    Resource
                  </th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                    User / IP
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="h-24 text-center text-muted-foreground">
                      No audit log records found.
                    </td>
                  </tr>
                ) : (
                  logs.map((logItem: unknown) => {
                    const log = logItem as Record<string, unknown>;
                    return (
                      <tr
                        key={String(log.id)}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <td className="p-4 font-mono text-xs text-muted-foreground">
                          {new Date(String(log.createdAt)).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="font-mono text-xs">
                            {String(log.action)}
                          </Badge>
                        </td>
                        <td className="p-4 font-medium">{String(log.resource)}</td>
                        <td className="p-4 text-xs font-mono text-muted-foreground">
                          {String(log.userEmail || log.userId || 'Anonymous')} (
                          {String(log.ipAddress || '127.0.0.1')})
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
