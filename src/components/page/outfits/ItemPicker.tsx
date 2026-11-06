"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useState } from "react";

import { outfitRequest } from "@/lib/outfits/api";
import {
  type CatalogItem,
  type OutfitItem,
  type OutfitSlot,
  slotLabel,
} from "@/types/outfits";
export default function ItemPicker({
  slot,
  value,
  onChange,
  required = false,
}: {
  slot: OutfitSlot;
  value?: OutfitItem;
  onChange: (item?: OutfitItem) => void;
  required?: boolean;
}) {
  const id = useId();
  const [text, setText] = useState(value?.name ?? "");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  useEffect(() => {
    if (value) setText(value.name);
  }, [value]);
  useEffect(() => {
    const timeout = setTimeout(() => setQuery(text.trim()), 200);
    return () => clearTimeout(timeout);
  }, [text]);
  const catalog = useQuery({
    queryKey: ["outfit-items", slot, query],
    queryFn: ({ signal }) =>
      outfitRequest<CatalogItem[]>(
        `/items?${new URLSearchParams({ slot, query })}`,
        { signal },
      ),
    enabled: open && !!query,
    staleTime: 60000,
  });
  const motions = useQuery({
    queryKey: ["outfit-motions", query],
    queryFn: ({ signal }) =>
      outfitRequest<string[]>(`/motions?${new URLSearchParams({ query })}`, {
        signal,
      }),
    enabled: open && !!query && slot === "MOTION",
    staleTime: 60000,
  });
  const options: OutfitItem[] = [
    ...(catalog.data ?? []).map((item) => ({
      ...item,
      slot,
      inputType: "CATALOG" as const,
    })),
    ...(motions.data ?? []).map((name) => ({
      slot,
      name,
      inputType: "CUSTOM" as const,
    })),
  ];
  const choose = (item: OutfitItem) => {
    onChange(item);
    setText(item.name);
    setOpen(false);
    setActive(-1);
  };
  return (
    <div className="relative min-w-0">
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {slotLabel(slot)}
        {required && <span aria-label="필수"> *</span>}
      </label>
      <div className="flex gap-1">
        <input
          id={id}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && !!query}
          aria-controls={`${id}-options`}
          aria-activedescendant={
            active >= 0 ? `${id}-option-${active}` : undefined
          }
          aria-required={required}
          value={text}
          placeholder={
            slot === "MOTION"
              ? "제스처 검색 또는 모션 입력"
              : "아이템명 검색 후 선택"
          }
          className="min-h-11 min-w-0 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            const next = event.target.value;
            onChange(undefined);
            setText(next);
            setOpen(true);
            setActive(-1);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActive((index) => Math.min(index + 1, options.length - 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((index) => Math.max(index - 1, 0));
            }
            if (event.key === "Enter" && open) {
              event.preventDefault();
              if (active >= 0 && options[active]) choose(options[active]);
            }
          }}
        />
        {text && (
          <button
            type="button"
            aria-label={`${slotLabel(slot)} 지우기`}
            className="min-h-11 min-w-11 rounded-lg border border-border"
            onClick={() => {
              setText("");
              onChange(undefined);
              setOpen(false);
            }}
          >
            ×
          </button>
        )}
      </div>
      {value && (
        <p className="mt-1 text-xs text-muted-foreground">
          {value.inputType === "CUSTOM"
            ? "직접 입력한 모션"
            : "목록에서 선택됨"}
        </p>
      )}
      {open && query && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
          <ul
            id={`${id}-options`}
            role="listbox"
            className="max-h-64 overflow-auto"
          >
            {options.map((item, index) => (
              <li
                role="option"
                id={`${id}-option-${index}`}
                aria-selected={active === index}
                key={`${item.inputType}-${item.name}-${item.topCategory}-${item.subCategory}`}
              >
                <button
                  type="button"
                  className={`min-h-11 w-full px-3 py-2 text-left text-sm hover:bg-accent ${active === index ? "bg-accent" : ""}`}
                  onClick={() => choose(item)}
                >
                  {item.name}
                  <span className="block text-xs text-muted-foreground">
                    {item.inputType === "CUSTOM"
                      ? "등록된 모션"
                      : `${item.topCategory} · ${item.subCategory}`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {catalog.isLoading && (
            <p role="status" className="p-3 text-sm">
              아이템을 찾고 있어요.
            </p>
          )}
          {catalog.isError && (
            <button
              type="button"
              className="min-h-11 px-3 text-sm"
              onClick={() => void catalog.refetch()}
            >
              목록을 불러오지 못했어요. 다시 시도
            </button>
          )}
          {!catalog.isLoading && !catalog.isError && options.length === 0 && (
            <p className="p-3 text-sm">일치하는 아이템이 없어요.</p>
          )}
          {slot === "MOTION" && (
            <button
              type="button"
              className="min-h-11 w-full border-t border-border px-3 text-left text-sm"
              disabled={[...query].length > 100}
              onClick={() =>
                choose({
                  slot,
                  inputType: "CUSTOM",
                  name: query.normalize("NFC"),
                })
              }
            >
              “{query}” 모션으로 직접 입력
            </button>
          )}
          <button
            type="button"
            className="min-h-11 w-full border-t border-border text-sm"
            onClick={() => setOpen(false)}
          >
            목록 닫기
          </button>
        </div>
      )}
    </div>
  );
}
