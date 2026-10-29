import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Admin Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Env values pasted into a dashboard often carry stray spaces or a trailing newline, and phone keyboards
        // capitalise the first letter of an email, so trim both sides and compare the email case-insensitively.
        const adminEmail    = process.env.ADMIN_EMAIL?.trim();
        const adminPassword = process.env.ADMIN_PASSWORD?.trim();
        const email         = credentials?.email?.trim();
        const password      = credentials?.password;

        if (
          adminEmail && adminPassword && email && password &&
          email.toLowerCase() === adminEmail.toLowerCase() &&
          password.trim() === adminPassword
        ) {
          return {
            id:    '1',
            name:  'Admin',
            email: adminEmail,
            role:  'admin',
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge:   60 * 60 * 24, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
