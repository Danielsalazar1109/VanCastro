"use client";

import { SessionProvider } from "next-auth/react";

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Determine the base path based on environment
  const basePath = process.env.NODE_ENV === "production"
    ? "https://vancastro.vercel.app/api/auth"
    : "/api/auth";

  return (
    <SessionProvider
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true} // Refetch session when window regains focus
      basePath={basePath} // Explicitly set the base path for API requests
    >
      {children}
    </SessionProvider>
  );
}