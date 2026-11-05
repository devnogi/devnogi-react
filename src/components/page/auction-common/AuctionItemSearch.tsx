"use client";

import { Search, X } from "lucide-react";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Autocomplete from "@/components/commons/Autocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ItemInfo, useItemInfos } from "@/hooks/useItemInfos";

interface AuctionItemSearchProps {
  value: string;
  onSearch: (itemName: string, selectedItem?: ItemInfo) => void;
}

export default function AuctionItemSearch({
  value,
  onSearch,
}: AuctionItemSearchProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: items = [], isLoading } = useItemInfos();

  useEffect(() => setInputValue(value), [value]);

  const filteredItems = useMemo(() => {
    const term = inputValue.trim().toLowerCase();
    if (!term) return [];
    return (Array.isArray(items) ? items : [])
      .filter((item) => item.name.toLowerCase().includes(term))
      .slice(0, 10);
  }, [inputValue, items]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setIsOpen(false);
    setSelectedIndex(-1);
    onSearch(inputValue.trim());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && selectedIndex >= 0) {
      const selected = filteredItems[selectedIndex];
      if (selected) {
        event.preventDefault();
        setInputValue(selected.name);
        setIsOpen(false);
        setSelectedIndex(-1);
        onSearch(selected.name, selected);
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((current) =>
        Math.min(current + 1, filteredItems.length - 1),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((current) => Math.max(current - 1, -1));
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <form
      className="mb-4 rounded-xl border border-[var(--color-ds-neutral-tone)] bg-white p-3 dark:bg-navy-700"
      onSubmit={submit}
      role="search"
    >
      <label
        className="mb-2 block text-sm font-semibold text-[var(--color-ds-text)]"
        htmlFor="auction-item-search"
      >
        아이템 검색
      </label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--color-ds-disabled)]"
          />
          <Input
            ref={inputRef}
            id="auction-item-search"
            value={inputValue}
            autoComplete="off"
            className="h-11 rounded-lg pl-9 pr-10"
            placeholder="아이템 이름을 입력하세요"
            onChange={(event) => {
              setInputValue(event.target.value);
              setIsOpen(event.target.value.trim().length > 0);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsOpen(inputValue.trim().length > 0)}
            onKeyDown={handleKeyDown}
          />
          {inputValue ? (
            <button
              type="button"
              aria-label="아이템 검색어 지우기"
              className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[var(--color-ds-disabled)] hover:bg-gray-100"
              onClick={() => {
                setInputValue("");
                setIsOpen(false);
                onSearch("");
                inputRef.current?.focus();
              }}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <Autocomplete
            items={items}
            value={inputValue}
            isLoading={isLoading}
            externalIsOpen={isOpen}
            onIsOpenChange={setIsOpen}
            externalSelectedIndex={selectedIndex}
            onSelectedIndexChange={setSelectedIndex}
            onSelect={(item) => {
              setInputValue(item.name);
              setIsOpen(false);
              onSearch(item.name, item);
            }}
          />
        </div>
        <Button type="submit" className="h-11 px-5">
          검색
        </Button>
      </div>
    </form>
  );
}
