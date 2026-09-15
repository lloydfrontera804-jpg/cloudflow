import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/server/db';
import { UserDoc } from '@/lib/server/user-logic';
import { isAdminEmail } from '@/lib/server/machine-logic';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.toLowerCase().trim();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const db = await getDb();
        const user = await db.collection<UserDoc>('users').findOne({ email });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user._id, email: user.email, name: user.name };
      },
    }),
  ],
  session: {
    // No database session table needed — the Credentials provider issues a
    // signed JWT, verified against AUTH_SECRET on every request.
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
        token.name = user.name;
        token.isAdmin = isAdminEmail(user.email);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string | null | undefined;
        session.user.isAdmin = !!token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: '/', // we render our own email/password form directly on the page instead of Auth.js's default screen
  },
});
