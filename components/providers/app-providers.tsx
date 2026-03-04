"use client";

import { useEffect } from "react";
import { ReactNode } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { setApiAccessToken, setApiRefreshToken } from "@/lib/api";

function SessionTokenSync() {
  const { data: session } = useSession();

  useEffect(() => {
    setApiAccessToken(session?.accessToken || null);
    setApiRefreshToken(session?.refreshToken || null);
  }, [session?.accessToken, session?.refreshToken]);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SessionTokenSync />
      <QueryProvider>
        {children}
        <Toaster richColors position="top-right" />
      </QueryProvider>
    </SessionProvider>
  );
}
