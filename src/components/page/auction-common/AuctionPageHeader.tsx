import type { ReactNode } from "react";

import AuctionViewTabs from "./AuctionViewTabs";

export default function AuctionPageHeader({
  currentView,
  children,
}: {
  currentView: "history" | "realtime";
  children?: ReactNode;
}) {
  return (
    <header className="mb-4">
      <h1 className="text-xl font-bold text-[var(--color-ds-text)] md:text-2xl">
        {currentView === "history" ? "경매장 거래내역" : "경매장 현재 매물"}
      </h1>
      <AuctionViewTabs currentView={currentView} />
      {children}
    </header>
  );
}
