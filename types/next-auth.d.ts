import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      _id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    _id: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    name?: string;
    email?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    _id?: string;
  }
}
