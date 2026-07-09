'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { FlaskConical, Check, X, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/skeleton';
import { QualityBadge, ConfidenceBar } from '@/components/shared/quality-badge';
import { apiGet, apiPost } from '@/lib/api/client';
import { formatRelative } from '@/lib/utils';
import { toast } from 'sonner';
import type { QualityLabel } from '@milkboy/shared';

interface LabValidation {
  id: string;
  scanId: string;
  scan: { id: string; title?: string; userId: string };
  aiQualityLabel: QualityLabel;
  aiConfidence: number;
  labQualityLabel?: QualityLabel;
  fat?: number;
  protein?: number;
  lactose?: number;
  snf?: number;
  ph?: number;
  density?: number;
  status: 'pending' | 'approved' | 'rejected';
  validatedAt?: string;
  createdAt: string;
}

export default function LabPage() {
  const { data: session } = useSession();
  const token = session?.user.accessToken ?? '';
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<LabValidation | null>(null);
  const [notes, setNotes] = useState('');

  const { data: validations, isLoading } = useQuery({
    queryKey: ['lab-validations'],
    queryFn: () => apiGet<{ data: LabValidation[] }>('/lab/validations', token),
    enabled: !!token,
  });

  const validateMutation = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'approved' | 'rejected' }) =>
      apiPost(`/lab/validations/${id}/validate`, { decision, notes }, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['lab-validations'] });
      setSelected(null);
      setNotes('');
      toast.success('Validation submitted');
    },
    onError: () => toast.error('Failed to submit validation'),
  });

  if (isLoading && !validations) return <PageSkeleton />;

  const pending = (validations?.data ?? []).filter((v) => v.status === 'pending');
  const reviewed = (validations?.data ?? []).filter((v) => v.status !== 'pending');

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-primary" />
          Lab Validation Queue
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Review AI predictions and submit lab verification results
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{pending.length}</p>
              <p className="text-xs text-muted-foreground">Pending review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Check className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">
                {reviewed.filter((v) => v.status === 'approved').length}
              </p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <X className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">
                {reviewed.filter((v) => v.status === 'rejected').length}
              </p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Validation queue list */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Pending ({pending.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {pending.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">All validations complete!</p>
              </div>
            ) : (
              <div className="divide-y">
                {pending.map((v) => (
                  <button
                    key={v.id}
                    className={`w-full text-left px-4 py-3 hover:bg-muted/30 transition-colors ${selected?.id === v.id ? 'bg-muted/50' : ''}`}
                    onClick={() => setSelected(v)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {v.scan.title ?? `Scan #${v.scanId.slice(0, 8)}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatRelative(v.createdAt)}
                        </p>
                      </div>
                      <QualityBadge label={v.aiQualityLabel} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Validation detail panel */}
        <Card className="lg:col-span-3">
          {selected ? (
            <>
              <CardHeader>
                <CardTitle className="text-base">
                  Validate: {selected.scan.title ?? `Scan #${selected.scanId.slice(0, 8)}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* AI result */}
                <div className="rounded-lg border p-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    AI Prediction
                  </p>
                  <div className="flex items-center gap-3">
                    <QualityBadge label={selected.aiQualityLabel} showDot />
                    <ConfidenceBar value={selected.aiConfidence} className="flex-1" />
                  </div>
                </div>

                {/* Lab input */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Lab Parameters
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {['fat', 'protein', 'lactose', 'snf', 'ph', 'density'].map((param) => (
                      <div key={param} className="space-y-1">
                        <label className="text-xs text-muted-foreground capitalize">{param}</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="—"
                          className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Notes</label>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Lab observations..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2"
                    loading={validateMutation.isPending}
                    onClick={() =>
                      validateMutation.mutate({ id: selected.id, decision: 'rejected' })
                    }
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    className="flex-1 gap-2 bg-emerald-500 hover:bg-emerald-600"
                    loading={validateMutation.isPending}
                    onClick={() =>
                      validateMutation.mutate({ id: selected.id, decision: 'approved' })
                    }
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Select a validation to review</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
