import Link from 'next/link';
import { ShieldX, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '403 — Forbidden' };

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-display font-bold">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm">
          You don&apos;t have permission to access this page. Contact your administrator if you
          believe this is a mistake.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back home
        </Link>
      </div>
    </div>
  );
}
