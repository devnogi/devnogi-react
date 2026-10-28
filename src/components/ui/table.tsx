"use client";

import * as React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function RowTooltip({
  content,
  position,
}: {
  content: React.ReactNode;
  position: { x: number; y: number };
}) {
  const offset = 8;
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    visibility: "hidden",
  });

  useLayoutEffect(() => {
    const ref = tooltipRef.current;
    if (!ref) return;

    const { width, height } = ref.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 가로 보정
    let left = position.x + offset;
    if (left + width + offset > vw) {
      left = Math.max(offset, position.x - width);
    }

    // 세로 보정
    let top = position.y + offset;
    if (top + height + offset > vh) {
      top = Math.max(offset, position.y - height);
    }

    setStyle({ top, left, visibility: "visible" });
  }, [position.x, position.y]);

  return createPortal(
    <div
      ref={tooltipRef}
      style={style}
      className="fixed z-[9999] max-w-xs rounded bg-black/80 px-2 py-1 text-xs text-white shadow-lg pointer-events-none whitespace-pre-line"
    >
      {content}
    </div>,
    document.body,
  );
}

function TableRow({
  className,
  children,
  tooltipContent,
  ...props
}: React.ComponentProps<"tr"> & { tooltipContent?: React.ReactNode }) {
  const [{ visible, x, y, touch }, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    touch: false,
  });

  const showTooltip = (e: React.PointerEvent) => {
    setTooltip({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      touch: e.pointerType === "touch",
    });
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    setTooltip((t) => ({ ...t, x: e.clientX, y: e.clientY }));
  };
  const hideTooltip = () => {
    setTooltip((t) => ({ ...t, visible: false }));
  };

  React.useEffect(() => {
    if (!visible || !touch) return;
    const close = () => hideTooltip();
    document.addEventListener("pointerdown", close, {
      capture: true,
      once: true,
    });
  }, [visible, touch]);

  return (
    <>
      <tr
        data-slot="table-row"
        className={cn(
          "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
          className,
        )}
        onPointerEnter={(e) => e.pointerType !== "touch" && showTooltip(e)}
        onPointerMove={(e) => e.pointerType !== "touch" && handlePointerMove(e)}
        onPointerLeave={(e) => e.pointerType !== "touch" && hideTooltip()}
        onPointerDown={(e) =>
          e.pointerType === "touch" && visible ? hideTooltip() : showTooltip(e)
        }
        {...props}
      >
        {children}
      </tr>

      {visible && tooltipContent && (
        <RowTooltip content={tooltipContent} position={{ x, y }} />
      )}
    </>
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-center align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 text-center align-middle whitespace-nowrap select-text cursor-default [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
