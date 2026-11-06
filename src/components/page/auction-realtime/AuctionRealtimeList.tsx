"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

import ItemOptionPopover from "@/components/page/auction-history/ItemOptionPopover";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { AuctionRealtimeItem } from "@/hooks/useAuctionRealtime";

interface AuctionRealtimeListProps {
  items: AuctionRealtimeItem[];
  isLoading?: boolean;
  previewEnabled?: boolean;
}

function formatPrice(price: number) {
  if (price === 0) return "0";
  const eok = Math.floor(price / 100000000),
    man = Math.floor((price % 100000000) / 10000),
    rest = price % 10000;
  return [
    eok > 0 ? `${eok}억` : "",
    man > 0 ? `${man.toLocaleString("ko-KR")}만` : "",
    rest > 0 || (eok === 0 && man === 0) ? rest.toLocaleString("ko-KR") : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function formatDateShort(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function enchantPrefix(displayName: string, itemName: string) {
  return displayName.replace(itemName, "").trim();
}

function itemNameWithoutAttributes(itemName: string) {
  return itemName.replace(/\s*\([^)]*\)/g, "").trim();
}

function itemAttributes(itemName: string) {
  return (itemName.match(/\(([^)]+)\)/g) ?? []).map((value) =>
    value.replace(/[()]/g, "").trim(),
  );
}

function RealtimeDesktopRow({
  item,
  href,
  previewEnabled,
}: {
  item: AuctionRealtimeItem;
  href: string;
  previewEnabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={previewEnabled && open} onOpenChange={setOpen}>
      <Link
        href={href}
        className="grid min-h-16 grid-cols-[minmax(0,1fr)_72px_184px_88px_32px] items-center gap-2.5 px-4 py-3 transition-colors hover:bg-[var(--color-ds-primary-50)] focus-visible:bg-[var(--color-ds-primary-50)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-ds-primary)]"
        onFocus={() => previewEnabled && setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <div className="flex min-w-0 items-center">
          <PopoverAnchor asChild>
            <span
              className="min-w-0 break-words text-sm leading-5 font-medium text-[var(--color-ds-text)]"
              onMouseEnter={() => previewEnabled && setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              {item.itemDisplayName}
            </span>
          </PopoverAnchor>
        </div>
        <div className="flex min-w-0 items-center justify-center">
          <Badge className="max-w-full rounded-md border-0 bg-[var(--color-ds-primary-50)] px-2 py-0.5 text-center text-xs leading-[18px] whitespace-normal break-words text-[var(--color-ds-primary)]">
            {item.itemSubCategory}
          </Badge>
        </div>
        <div className="flex items-baseline justify-end whitespace-nowrap text-[15px] leading-5 font-semibold tabular-nums text-[var(--color-ds-text)]">
          {formatPrice(item.auctionPricePerUnit)}
          <span className="ml-1 text-xs leading-[18px] font-normal text-muted-foreground">
            G
          </span>
        </div>
        <div className="flex min-w-0 items-center justify-center whitespace-nowrap text-xs leading-[18px] tabular-nums text-muted-foreground">
          {formatDateShort(item.dateAuctionExpire)}
        </div>
        <div className="flex min-w-0 items-center justify-center whitespace-nowrap text-xs leading-[18px] tabular-nums text-muted-foreground">
          {item.itemCount}
        </div>
      </Link>
      {previewEnabled ? (
        <PopoverContent
          className="max-h-[70vh] w-80 rounded-lg border border-gray-200 bg-white p-3 dark:border-navy-600 dark:bg-navy-800"
          side="right"
          align="start"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <ItemOptionPopover
            itemDisplayName={item.itemDisplayName}
            itemOptions={item.itemOptions}
            price={item.auctionPricePerUnit}
          />
        </PopoverContent>
      ) : null}
    </Popover>
  );
}

export default function AuctionRealtimeList({
  items,
  isLoading = false,
  previewEnabled = true,
}: AuctionRealtimeListProps) {
  const pathname = usePathname(),
    searchParams = useSearchParams();
  const returnTo = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;
  const hrefFor = (id: string) =>
    `/auction-realtime/${encodeURIComponent(id)}?${new URLSearchParams({ return_to: returnTo })}`;
  if (isLoading)
    return (
      <div className="visual-polish rounded-lg border border-[var(--color-ds-neutral-tone)] bg-[var(--color-ds-card)] py-12 text-center text-muted-foreground">
        로딩 중...
      </div>
    );
  if (items.length === 0)
    return (
      <div className="visual-polish rounded-lg border border-[var(--color-ds-neutral-tone)] bg-[var(--color-ds-card)] py-12 text-center">
        <p className="text-lg text-muted-foreground">검색 결과가 없습니다.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          다른 검색 조건으로 시도해보세요.
        </p>
      </div>
    );
  return (
    <>
      <div className="visual-polish overflow-hidden rounded-lg border border-[var(--color-ds-neutral-tone)] bg-[var(--color-ds-card)] md:hidden">
        <div className="divide-y divide-[var(--color-ds-neutral-tone)]">
          {items.map((item) => (
            <Link
              key={item.auctionId}
              href={hrefFor(item.auctionId)}
              className="block px-4 py-4 transition-colors hover:bg-[var(--color-ds-primary-50)] focus-visible:outline-2 focus-visible:outline-[var(--color-ds-primary)]"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="min-w-0 flex-1 line-clamp-2 break-words text-sm leading-5 font-medium text-[var(--color-ds-text)]">
                  {itemNameWithoutAttributes(item.itemName)}
                </h3>
                <span className="shrink-0 whitespace-nowrap text-[15px] leading-5 font-semibold tabular-nums text-[var(--color-ds-text)]">
                  {formatPrice(item.auctionPricePerUnit)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    G
                  </span>
                </span>
              </div>
              {enchantPrefix(item.itemDisplayName, item.itemName) && (
                <div className="mb-1 break-words text-xs leading-[18px] text-muted-foreground">
                  {enchantPrefix(item.itemDisplayName, item.itemName)}
                </div>
              )}
              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 text-xs leading-[18px] tabular-nums text-muted-foreground">
                <span className="min-w-0 break-words">
                  {itemAttributes(item.itemName)
                    .map((value) => `#${value}`)
                    .join(" ")}
                </span>
                <span>
                  {formatDateShort(item.dateAuctionExpire)}
                  {item.itemCount > 1 ? ` · ×${item.itemCount}` : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="visual-polish hidden overflow-hidden rounded-lg border border-[var(--color-ds-neutral-tone)] bg-[var(--color-ds-card)] md:block">
        <div className="grid grid-cols-[minmax(0,1fr)_72px_184px_88px_32px] gap-2.5 border-b border-[var(--color-ds-neutral-tone)] bg-[var(--color-ds-neutral-50)] px-4 py-2 text-xs leading-[18px] font-medium text-muted-foreground">
          <div className="min-w-0">아이템 이름</div>
          <div className="text-center">카테고리</div>
          <div className="text-right">가격</div>
          <div className="text-center">만료일시</div>
          <div className="text-center">수량</div>
        </div>
        <div className="divide-y divide-[var(--color-ds-neutral-tone)]">
          {items.map((item) => (
            <RealtimeDesktopRow
              key={item.auctionId}
              item={item}
              href={hrefFor(item.auctionId)}
              previewEnabled={previewEnabled}
            />
          ))}
        </div>
      </div>
    </>
  );
}
