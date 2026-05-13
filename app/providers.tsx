"use client";

/**
 * Client-side providers. Hoisted into its own file because the root layout
 * stays a server component — wrapping <html> in a client provider would
 * force the whole tree client-side.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Storage is the GitHub repo — refetches are cheap, but we keep a
            // short staleTime so list views don't reread on every tab focus.
            staleTime: 15_000,
            refetchOnWindowFocus: false,
            retry: 1
          }
        }
      })
  );
  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
