'use client';

import { useSession, signOut } from 'next-auth/react';
import { Bell, Sun, Moon, Monitor, LogOut, Settings, User, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/stores/ui.store';
import { getInitials, snakeToTitle } from '@/lib/utils';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Link from 'next/link';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor };

export function Topbar() {
  const { data: session } = useSession();
  const { theme, setTheme, notificationPanelOpen, setNotificationPanelOpen } = useUIStore();

  // Apply theme class to document root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const ThemeIcon = THEME_ICONS[theme];
  const user = session?.user;

  return (
    <header className="h-16 flex items-center justify-between border-b bg-background px-6 shrink-0">
      {/* Page title slot — filled by children via breadcrumb */}
      <div id="topbar-breadcrumb" />

      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Change theme">
              <ThemeIcon className="h-4 w-4" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[130px] rounded-lg border bg-popover p-1 text-popover-foreground shadow-md animate-fade-in"
              align="end"
            >
              {(['light', 'dark', 'system'] as const).map((t) => {
                const Icon = THEME_ICONS[t];
                return (
                  <DropdownMenu.Item
                    key={t}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer outline-none hover:bg-accent',
                      theme === t && 'bg-accent',
                    )}
                    onSelect={() => setTheme(t)}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </DropdownMenu.Item>
                );
              })}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Notifications"
          onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
        >
          <Bell className="h-4 w-4" />
        </Button>

        {/* User menu */}
        {user && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-accent transition-colors outline-none">
                <Avatar className="h-7 w-7">
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.firstName} />}
                  <AvatarFallback className="text-xs">
                    {getInitials(user.firstName ?? '', user.lastName ?? '')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {snakeToTitle(user.role ?? '')}
                  </p>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[180px] rounded-lg border bg-popover p-1 text-popover-foreground shadow-md animate-fade-in"
                align="end"
              >
                <div className="px-2 py-1.5 border-b mb-1">
                  <p className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenu.Item asChild>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer outline-none hover:bg-accent"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Settings
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link
                    href="/settings/profile"
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer outline-none hover:bg-accent"
                  >
                    <User className="h-3.5 w-3.5" />
                    Profile
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer outline-none hover:bg-destructive/10 text-destructive"
                  onSelect={() => signOut({ callbackUrl: '/login' })}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>
    </header>
  );
}
