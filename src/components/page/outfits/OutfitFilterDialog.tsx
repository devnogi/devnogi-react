"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { OutfitItem, OutfitSlot } from "@/types/outfits";

import ItemPicker from "./ItemPicker";

export default function OutfitFilterDialog({
  category,
  items,
  onApply,
  onClose,
  returnFocus,
}: {
  category: { label: string; slots: readonly OutfitSlot[] } | null;
  items: OutfitItem[];
  onApply: (items: OutfitItem[]) => void;
  onClose: () => void;
  returnFocus: () => void;
}) {
  const [draft, setDraft] = useState(items);
  const [pickerVersion, setPickerVersion] = useState(0);
  const slots = category?.slots ?? [];
  useEffect(() => {
    if (!category) return;
    setDraft(items);
    setPickerVersion((value) => value + 1);
  }, [category, items]);
  return (
    <Dialog
      open={!!category}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{category?.label ?? "의장 필터"}로 찾기</DialogTitle>
          <DialogDescription>
            선택한 아이템을 착용한 의장을 찾아요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {slots.map((slot) => (
            <ItemPicker
              key={slot + "-" + pickerVersion}
              slot={slot}
              value={draft.find((item) => item.slot === slot)}
              onChange={(item) =>
                setDraft((current) => [
                  ...current.filter((entry) => entry.slot !== slot),
                  ...(item ? [item] : []),
                ])
              }
            />
          ))}
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={() => {
              setDraft((current) =>
                current.filter((item) => !slots.includes(item.slot)),
              );
              setPickerVersion((value) => value + 1);
            }}
            className="min-h-11 rounded-lg border border-border px-4 text-sm"
          >
            선택 해제
          </button>
          <button
            type="button"
            onClick={() => onApply(draft)}
            className="min-h-11 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground"
          >
            의장 보기
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
