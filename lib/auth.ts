import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { APP_CONFIG } from "@/lib/constants";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        try {
          const response = await fetch(`${APP_CONFIG.baseUrl}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(parsed.data),
          });

          if (!response.ok) return null;

          const result = await response.json();
          const data = result?.data;

          const accessToken = data?.accessToken ?? data?.user?.accessToken;
          const refreshToken = data?.refreshToken ?? data?.user?.refreshToken;
          const role = (data?.user?.role as string | undefined)?.toLowerCase();
          if (!accessToken || !refreshToken || role !== "admin") {
            return null;
          }

          return {
            id: data.user._id,
            _id: data.user._id,
            role,
            accessToken,
            refreshToken,
            name: data.user.name,
            email: data.user.email,
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
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.refreshToken = (user as { refreshToken?: string }).refreshToken;
        token.role = (user as { role?: string }).role;
        token._id = (user as { _id?: string })._id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;
      if (session.user) {
        session.user.role = (token.role as string) || "";
        session.user._id = (token._id as string) || "";
      }
      return session;
    },
    async signIn({ user }) {
      return (user as { role?: string }).role === "admin";
    },
  },
};
