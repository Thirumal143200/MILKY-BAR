import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';

export default async function SuperAdminLayoutServer({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user.role !== 'super_admin') {
    redirect('/403');
  }
  return <>{children}</>;
}
