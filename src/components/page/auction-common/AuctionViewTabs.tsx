"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuctionViewTabs({
  currentView,
}: {
  currentView: "history" | "realtime";
}) {
  const searchParams = useSearchParams();
  const itemQuery = new URLSearchParams();
  const fields = [
    ["item_name", "itemName"],
    ["top_category", "itemTopCategory", "topCategory"],
    ["sub_category", "itemSubCategory", "subCategory"],
  ];
  for (const [name, ...aliases] of fields) {
    const value = [name, ...aliases]
      .map((key) => searchParams.get(key))
      .find(Boolean);
    if (value) itemQuery.set(name, value);
  }
  const suffix = itemQuery.size ? `?${itemQuery.toString()}` : "";

  return (
    <nav aria-label="경매장 조회 유형" className="mt-3 flex gap-2">
      {[
        { view: "history", href: "/auction-history", label: "거래내역" },
        { view: "realtime", href: "/auction-realtime", label: "현재 매물" },
      ].map(({ view, href, label }) => (
        <Link
          key={view}
          href={`${href}${suffix}`}
          aria-current={view === currentView ? "page" : undefined}
          className={`inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            view === currentView
              ? "border-primary bg-primary text-primary-foreground"
              : "border-[var(--color-ds-neutral-tone)] bg-[var(--color-ds-card)] text-[var(--color-ds-text)] hover:bg-[var(--color-ds-primary-50)]"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
