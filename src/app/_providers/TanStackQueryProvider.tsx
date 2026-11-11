"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { clientAxios } from "@/lib/api/clients";
import { installExperienceRefresh } from "@/lib/api/experience-refresh";
import { createQueryClient } from "@/lib/api/query-client";

export default function TanStackQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(createQueryClient);

  useEffect(
    () => installExperienceRefresh(clientAxios, queryClient),
    [queryClient],
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
