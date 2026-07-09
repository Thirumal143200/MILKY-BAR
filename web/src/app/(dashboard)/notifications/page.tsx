'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/skeleton';
import { notificationsApi, type Notification } from '@/lib/api/notifications';
import { formatRelative } from '@/lib/utils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const TYPE_ICON: Record<Notification['type'], React.ElementType> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const TYPE_COLOR: Record<Notification['type'], string> = {
  info: 'text-blue-500',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  error: 'text-red-500',
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const token = session?.user.accessToken ?? '';
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(token, { limit: 50 }),
    enabled: !!token,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(token, id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  if (isLoading && !data) return <PageSkeleton />;

  const notifications = data?.data ?? [];
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Notifications
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {unread} unread notification{unread !== 1 ? 's' : ''}
          </p>
        </div>
        {unread > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            loading={markAllMutation.isPending}
            onClick={() => markAllMutation.mutate()}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => {
                const Icon = TYPE_ICON[n.type];
                return (
                  <div
                    key={n.id}
                    className={cn(
                      'flex items-start gap-4 px-6 py-4 transition-colors',
                      !n.read && 'bg-primary/3',
                    )}
                  >
                    <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', TYPE_COLOR[n.type])} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm', !n.read && 'font-semibold')}>{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelative(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <button
                        onClick={() => markReadMutation.mutate(n.id)}
                        className="text-xs text-muted-foreground hover:text-foreground shrink-0 pt-0.5"
                      >
                        Mark read
                      </button>
                    )}
                    {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
