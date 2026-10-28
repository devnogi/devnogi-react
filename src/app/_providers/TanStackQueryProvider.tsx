"use client";

import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/lib/api/clients";

export default function TanStackQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
