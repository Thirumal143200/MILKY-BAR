'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Users, Search, Filter, Shield, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageSkeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/lib/api/admin';
import { getInitials, formatDate, snakeToTitle } from '@/lib/utils';
import { toast } from 'sonner';
import type { UserRole } from '@milkboy/shared';

const ROLE_OPTIONS: UserRole[] = ['super_admin', 'admin', 'producer', 'consumer', 'lab_staff'];

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const token = session?.user.accessToken ?? '';
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: () =>
      adminApi.listUsers(token, {
        page,
        limit: 20,
        search: search || undefined,
        role: roleFilter || undefined,
      }),
    enabled: !!token,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminApi.updateUserRole(token, userId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated');
    },
    onError: () => toast.error('Failed to update role'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      adminApi.updateUserStatus(token, userId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  if (isLoading && !data) return <PageSkeleton />;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          User Management
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Manage user accounts, roles, and permissions
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="text-sm border rounded-md px-3 py-2 bg-background"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All roles</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {snakeToTitle(r)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{data?.meta.total ?? 0} Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Joined</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                          <AvatarFallback className="text-xs">
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-muted-foreground text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        className="text-xs border rounded px-2 py-1 bg-background"
                        value={user.role}
                        onChange={(e) =>
                          updateRoleMutation.mutate({ userId: user.id, role: e.target.value })
                        }
                        disabled={user.role === 'super_admin'}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {snakeToTitle(r)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          user.status === 'active'
                            ? 'success'
                            : user.status === 'suspended'
                              ? 'destructive'
                              : 'warning'
                        }
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 justify-end">
                        {user.status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Suspend user"
                            onClick={() =>
                              updateStatusMutation.mutate({ userId: user.id, status: 'suspended' })
                            }
                          >
                            <UserX className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Activate user"
                            onClick={() =>
                              updateStatusMutation.mutate({ userId: user.id, status: 'active' })
                            }
                          >
                            <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon-sm" title="View permissions">
                          <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {data.meta.page} of {data.meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.meta.totalPages || page >= data.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
