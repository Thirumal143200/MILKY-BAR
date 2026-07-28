'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { FlaskConical, CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';

export default function LaboratoryPage() {
  const { data: session } = useSession();
  const token = session?.user.accessToken ?? '';

  const { data: labData, isLoading } = useQuery({
    queryKey: ['admin-lab-analytics'],
    queryFn: () => adminApi.labAnalytics(token),
    enabled: !!token,
  });

  if (isLoading && !labData) return <PageSkeleton />;

  const totalStaff = Number(labData?.totalLabStaff ?? 0);
  const pending = Number(labData?.pendingReviewsCount ?? 0);
  const confirmed = Number(labData?.confirmedCount ?? 0);
  const rejected = Number(labData?.rejectedCount ?? 0);
  const inconclusive = Number(labData?.inconclusiveCount ?? 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-primary" />
          Laboratory Validations & Staff Overview
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Laboratory staff workload, pending scan validation requests, confirmed vs rejected sample breakdown
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Queue</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting lab review</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed Samples</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{confirmed}</div>
            <p className="text-xs text-muted-foreground mt-1">Passed lab verification</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected Samples</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{rejected}</div>
            <p className="text-xs text-muted-foreground mt-1">Failed lab verification</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lab Technicians</CardTitle>
            <FlaskConical className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{totalStaff}</div>
            <p className="text-xs text-muted-foreground mt-1">Active lab staff</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Validation Breakdown Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Inconclusive Results</span>
            <span className="font-medium">{inconclusive}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Laboratory Verification Engine</span>
            <Badge variant="outline">Active</Badge>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">AI vs Lab Correlation Protocol</span>
            <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
              Synchronized
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
