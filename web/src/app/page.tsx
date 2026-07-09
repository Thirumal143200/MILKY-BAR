import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import type { UserRole } from '@milkboy/shared';

function getRoleHome(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return '/super-admin';
    case 'admin':
      return '/admin';
    case 'producer':
      return '/producer';
    case 'lab_staff':
      return '/lab';
    default:
      return '/consumer';
  }
}

export default async function RootPage() {
  const session = await auth();
  if (session?.user) {
    redirect(getRoleHome(session.user.role as UserRole));
  }
  redirect('/login');
}
