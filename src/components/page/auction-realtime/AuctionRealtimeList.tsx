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
        className="grid grid-cols-12 gap-4 px-4 py-2 transition-colors hover:bg-[var(--color-ds-primary-50)] focus-visible:bg-[var(--color-ds-primary-50)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-ds-primary)]"
        onFocus={() => previewEnabled && setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <div className="col-span-5 flex min-w-0 items-center">
          <PopoverAnchor asChild>
            <span
              className="truncate text-[13px] font-medium text-[var(--color-ds-text)]"
              onMouseEnter={() => previewEnabled && setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              {item.itemDisplayName}
            </span>
          </PopoverAnchor>
        </div>
        <div className="col-span-2 flex items-center justify-center">
          <Badge className="rounded-md border-0 bg-[var(--color-ds-primary-50)] px-2 py-0.5 text-xs text-[var(--color-ds-primary)]">
            {item.itemSubCategory}
          </Badge>
        </div>
        <div className="col-span-2 flex items-center justify-end whitespace-nowrap text-[13px] font-bold text-[var(--color-ds-primary)]">
          {formatPrice(item.auctionPricePerUnit)}
          <span className="ml-1 text-sm font-normal text-[var(--color-ds-disabled)]">
            G
          </span>
        </div>
        <div className="col-span-2 flex items-center justify-center text-sm text-[var(--color-ds-disabled)]">
          {formatDateShort(item.dateAuctionExpire)}
        </div>
        <div className="col-span-1 flex items-center justify-center text-sm text-[var(--color-ds-disabled)]">
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
      <div className="rounded-lg border bg-white py-12 text-center text-[var(--color-ds-disabled)] dark:bg-navy-700">
        로딩 중...
      </div>
    );
  if (items.length === 0)
    return (
      <div className="rounded-lg border bg-white py-12 text-center dark:bg-navy-700">
        <p className="text-lg text-[var(--color-ds-disabled)]">
          검색 결과가 없습니다.
        </p>
        <p className="mt-2 text-sm text-[var(--color-ds-disabled)]">
          다른 검색 조건으로 시도해보세요.
        </p>
      </div>
    );
  return (
    <>
      <div className="overflow-hidden rounded-lg border border-[var(--color-ds-neutral-tone)] bg-white md:hidden dark:bg-navy-700">
        <div className="divide-y divide-[var(--color-ds-neutral-tone)]">
          {items.map((item) => (
            <Link
              key={item.auctionId}
              href={hrefFor(item.auctionId)}
              className="block px-4 py-3 transition-colors hover:bg-[var(--color-ds-primary-50)] focus-visible:outline-2 focus-visible:outline-[var(--color-ds-primary)]"
            >
              <div className="mb-1 min-h-[14px] text-[10px] text-[var(--color-ds-disabled)]">
                {enchantPrefix(item.itemDisplayName, item.itemName) || "\u00A0"}
              </div>
              <div className="mb-1 flex items-center justify-between gap-2">
                <h3 className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[var(--color-ds-text)]">
                  {itemNameWithoutAttributes(item.itemName)}
                </h3>
                <span className="whitespace-nowrap text-[13px] font-bold text-[var(--color-ds-primary)]">
                  {formatPrice(item.auctionPricePerUnit)}{" "}
                  <span className="font-normal text-[var(--color-ds-disabled)]">
                    G
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-[var(--color-ds-disabled)]">
                <span className="truncate">
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
      <div className="hidden overflow-hidden rounded-lg border border-[var(--color-ds-neutral-tone)] bg-white md:block dark:bg-navy-700">
        <div className="grid grid-cols-12 gap-4 border-b border-[var(--color-ds-neutral-tone)] bg-[var(--color-ds-neutral-50)] px-4 py-2 text-sm font-semibold text-[var(--color-ds-ornamental)]">
          <div className="col-span-5">아이템 이름</div>
          <div className="col-span-2 text-center">카테고리</div>
          <div className="col-span-2 text-right">가격</div>
          <div className="col-span-2 text-center">만료일시</div>
          <div className="col-span-1 text-center">수량</div>
        </div>
        <div className="divide-y divide-[var(--color-ds-neutral-100)]">
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
