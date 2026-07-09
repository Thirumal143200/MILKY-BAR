import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import type { UserRole } from '@milkboy/shared';

// Extend session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      avatarUrl?: string;
      accessToken: string;
      refreshToken: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatarUrl?: string;
    accessToken: string;
    refreshToken: string;
  }
}

import 'next-auth/jwt';

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatarUrl?: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiry: number;
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  mfaCode: z.string().optional(),
});

const API_URL = process.env.API_URL ?? 'http://localhost:3001/api/v1';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        mfaCode: { label: 'MFA Code', type: 'text' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsed.data),
          });

          if (!res.ok) return null;

          const body = (await res.json()) as {
            data: {
              requiresMfa: boolean;
              user?: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                role: UserRole;
                avatarUrl?: string;
              };
              tokens?: { accessToken: string; refreshToken: string; expiresIn: number };
            };
          };

          if (body.data.requiresMfa || !body.data.user || !body.data.tokens) return null;

          return {
            id: body.data.user.id,
            email: body.data.user.email,
            firstName: body.data.user.firstName,
            lastName: body.data.user.lastName,
            role: body.data.user.role,
            avatarUrl: body.data.user.avatarUrl,
            accessToken: body.data.tokens.accessToken,
            refreshToken: body.data.tokens.refreshToken,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.avatarUrl = user.avatarUrl;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        // Expire in 14 minutes (access token is 15 min)
        token.accessTokenExpiry = Date.now() + 14 * 60 * 1000;
      }

      // Auto-refresh if near expiry
      if (Date.now() > (Number(token.accessTokenExpiry) || 0)) {
        try {
          const res = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: token.refreshToken }),
          });
          if (res.ok) {
            const body = (await res.json()) as {
              data: { accessToken: string; refreshToken: string };
            };
            token.accessToken = body.data.accessToken;
            token.refreshToken = body.data.refreshToken;
            token.accessTokenExpiry = Date.now() + 14 * 60 * 1000;
          }
        } catch {
          // refresh failed — session will be invalid
        }
      }

      return token;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.role = token.role as UserRole;
        session.user.avatarUrl = token.avatarUrl as string | undefined;
        session.user.accessToken = token.accessToken as string;
        session.user.refreshToken = token.refreshToken as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET ?? 'dev-nextauth-secret-change-in-production',
});
