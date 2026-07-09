'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  ScanLine,
  BarChart3,
  Bell,
  Settings,
  FlaskConical,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Droplets,
  FileText,
  Package,
  Layers,
  MessageSquare,
  Activity,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/stores/ui.store';
import type { UserRole } from '@milkboy/shared';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  // Super Admin
  { label: 'System Overview', href: '/super-admin', icon: Activity, roles: ['super_admin'] },
  { label: 'User Management', href: '/super-admin/users', icon: Users, roles: ['super_admin'] },
  { label: 'Audit Logs', href: '/super-admin/audit', icon: ShieldCheck, roles: ['super_admin'] },
  { label: 'AI Models', href: '/super-admin/models', icon: Layers, roles: ['super_admin'] },
  { label: 'System Health', href: '/super-admin/health', icon: Database, roles: ['super_admin'] },
  // Admin
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['admin'] },
  { label: 'Users', href: '/admin/users', icon: Users, roles: ['admin'] },
  { label: 'Lab Validations', href: '/admin/lab', icon: FlaskConical, roles: ['admin'] },
  { label: 'Reports', href: '/admin/reports', icon: FileText, roles: ['admin'] },
  { label: 'Batches', href: '/admin/batches', icon: Package, roles: ['admin'] },
  // Producer
  { label: 'My Scans', href: '/producer', icon: ScanLine, roles: ['producer'] },
  { label: 'Upload', href: '/producer/upload', icon: Droplets, roles: ['producer'] },
  { label: 'Batch Upload', href: '/producer/batches', icon: Package, roles: ['producer'] },
  { label: 'My Reports', href: '/producer/reports', icon: FileText, roles: ['producer'] },
  // Consumer
  { label: 'Scan History', href: '/consumer', icon: ScanLine, roles: ['consumer'] },
  { label: 'My Reports', href: '/consumer/reports', icon: FileText, roles: ['consumer'] },
  { label: 'Verify QR', href: '/consumer/verify', icon: ShieldCheck, roles: ['consumer'] },
  // Lab Staff
  { label: 'Validation Queue', href: '/lab', icon: FlaskConical, roles: ['lab_staff'] },
  { label: 'Statistics', href: '/lab/statistics', icon: BarChart3, roles: ['lab_staff'] },
  // Shared
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['super_admin', 'admin', 'producer', 'lab_staff'],
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: Bell,
    roles: ['super_admin', 'admin', 'producer', 'consumer', 'lab_staff'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['super_admin', 'admin', 'producer', 'consumer', 'lab_staff'],
  },
  {
    label: 'Feedback',
    href: '/settings/feedback',
    icon: MessageSquare,
    roles: ['producer', 'consumer', 'lab_staff'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();

  const role = session?.user.role as UserRole | undefined;
  const visibleItems = NAV_ITEMS.filter((item) => role && item.roles.includes(role));

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-4 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-8 w-8 rounded-lg gradient-brand flex items-center justify-center shrink-0">
            <Droplets className="h-4 w-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-display font-bold text-sidebar-foreground text-lg truncate">
              MilkBoy
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <ul className="space-y-0.5 px-2">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    sidebarCollapsed && 'justify-center px-2',
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="flex items-center gap-2 w-full">
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs">Collapse</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
