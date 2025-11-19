// app/Providers.tsx
"use client";

import TanStackQueryProvider from "@/app/_providers/TanStackQueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import React, { ReactNode } from "react";

const providers = [
  (children: ReactNode) => (
    <TanStackQueryProvider>{children}</TanStackQueryProvider>
  ),
  (children: ReactNode) => <AuthProvider>{children}</AuthProvider>,
];

export default function Providers({ children }: { children: ReactNode }) {
  return providers.reduce(
    (acc, Provider) => Provider(acc),
    children as ReactNode,
  );
}
