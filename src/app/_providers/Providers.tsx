// app/Providers.tsx
"use client";

import TanStackQueryProvider from "@/app/_providers/TanStackQueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConfigProvider } from "@/contexts/ConfigContext";
import React, { ReactNode } from "react";
import { Toaster } from "sonner";

const providers = [
  // ConfigProvider가 가장 먼저 로드되어야 다른 컴포넌트에서 사용 가능
  (children: ReactNode) => <ConfigProvider>{children}</ConfigProvider>,
  (children: ReactNode) => (
    <TanStackQueryProvider>{children}</TanStackQueryProvider>
  ),
  (children: ReactNode) => <AuthProvider>{children}</AuthProvider>,
];

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {providers.reduce((acc, Provider) => Provider(acc), children as ReactNode)}
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
