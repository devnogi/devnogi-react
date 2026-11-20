"use client";

import { useRef, useState } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function HeroAdminConfirm({
  label,
  title,
  description,
  disabled = false,
  destructive = true,
  onConfirm,
}: {
  label: string;
  title: string;
  description: string;
  disabled?: boolean;
  destructive?: boolean;
  onConfirm: () => Promise<unknown>;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  async function confirm() {
    setBusy(true);
    setError("");
    try {
      await onConfirm();
      setOpen(false);
      setDone(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "처리하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <Button
        ref={trigger}
        variant={destructive ? "destructive" : "outline"}
        className={`min-h-11 h-auto whitespace-normal px-3 py-2 text-left ${destructive ? "bg-red-700 text-white hover:bg-red-800 dark:bg-red-700 dark:hover:bg-red-800" : ""}`}
        disabled={disabled || busy}
        onClick={() => {
          setError("");
          setDone(false);
          setOpen(true);
        }}
      >
        {label}
      </Button>
      <AlertDialog
        open={open}
        onOpenChange={(value) => !busy && setOpen(value)}
      >
        <AlertDialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            trigger.current?.focus();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription className="break-words whitespace-pre-line">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error ? (
            <p role="alert" className="text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy} className="min-h-11">
              돌아가기
            </AlertDialogCancel>
            <Button
              className={`min-h-11 ${destructive ? "bg-red-700 text-white hover:bg-red-800 dark:bg-red-700 dark:hover:bg-red-800" : ""}`}
              variant={destructive ? "destructive" : "default"}
              disabled={busy}
              onClick={() => void confirm()}
            >
              {busy ? "처리 중…" : "확인하고 처리"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {done ? (
        <p role="status" className="mt-2 text-sm">
          처리했습니다.
        </p>
      ) : null}
    </div>
  );
}
