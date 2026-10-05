import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config (no database imports — safe for middleware).
 * The full config in src/auth.ts extends this with the adapter + providers.
 */
export const authConfig: NextAuthConfig = {
  providers: [],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as { role?: string }).role ?? "USER";
        token.uid = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as { role?: string }).role = (token.role as string) ?? "USER";
        (session.user as { id?: string }).id = (token.uid as string) ?? token.sub ?? "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
