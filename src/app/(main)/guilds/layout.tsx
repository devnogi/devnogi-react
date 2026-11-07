import "./guild.css";

import type { ReactNode } from "react";
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="guild-space mx-auto max-w-5xl px-4 py-8">{children}</main>
  );
}
