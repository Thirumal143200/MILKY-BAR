'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Droplets, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

import { Suspense } from 'react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        ...data,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid email or password. Please try again.');
        return;
      }

      toast.success('Signed in successfully!');
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-dark flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/20 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary/10 blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl gradient-brand flex items-center justify-center">
            <Droplets className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-white text-xl">MIRA</span>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-display font-bold text-white leading-tight mb-4">
            AI-Powered
            <br />
            Milk Quality
            <br />
            Detection
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Enterprise-grade quality monitoring for producers, labs, and consumers. Accurate, fast,
            and reliable.
          </p>
        </div>

        <div className="relative flex items-center gap-3 text-white/40 text-sm">
          <Shield className="h-4 w-4" />
          <span>SOC2 compliant · End-to-end encrypted · GDPR ready</span>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center mb-4">
            <div className="h-9 w-9 rounded-xl gradient-brand flex items-center justify-center">
              <Droplets className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl">MIRA</span>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold">Welcome back</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  className="pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" loading={loading} className="w-full gap-2">
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Contact your administrator
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}
    >
      <LoginForm />
    </Suspense>
  );
}
