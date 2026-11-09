"use client";

import Image from "next/image";
import {
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  clampCropPosition,
  cropOutfitPhoto,
  type CropPosition,
  type ImageSize,
  OUTFIT_PHOTO_ASPECT_RATIO,
} from "@/lib/outfits/photo-crop";

interface DragState {
  pointerId: number;
  clientX: number;
  clientY: number;
  overflowX: number;
  overflowY: number;
  position: CropPosition;
}

interface OutfitPhotoCropDialogProps {
  file: File;
  current: number;
  total: number;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

const CENTER = { x: 0, y: 0 };

export default function OutfitPhotoCropDialog({
  file,
  current,
  total,
  onCancel,
  onConfirm,
}: OutfitPhotoCropDialogProps) {
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceSize, setSourceSize] = useState<ImageSize | null>(null);
  const [position, setPosition] = useState<CropPosition>(CENTER);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSourceUrl(url);
    setSourceSize(null);
    setPosition(CENTER);
    setError(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    frameRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onCancel();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onCancel, saving]);

  const horizontal =
    !!sourceSize &&
    sourceSize.width / sourceSize.height > OUTFIT_PHOTO_ASPECT_RATIO;
  const vertical =
    !!sourceSize &&
    sourceSize.width / sourceSize.height < OUTFIT_PHOTO_ASPECT_RATIO;
  const objectPosition = `${horizontal ? ((position.x + 1) / 2) * 100 : 50}% ${vertical ? ((position.y + 1) / 2) * 100 : 50}%`;

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!sourceSize) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const sourceRatio = sourceSize.width / sourceSize.height;
    const frameRatio = bounds.width / bounds.height;
    const renderedWidth =
      sourceRatio > frameRatio ? bounds.height * sourceRatio : bounds.width;
    const renderedHeight =
      sourceRatio > frameRatio ? bounds.height : bounds.width / sourceRatio;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      overflowX: renderedWidth - bounds.width,
      overflowY: renderedHeight - bounds.height,
      position,
    };
    setDragging(true);
  };

  const movePhoto = (event: PointerEvent<HTMLDivElement>) => {
    const started = drag.current;
    if (!started || started.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - started.clientX;
    const deltaY = event.clientY - started.clientY;
    setPosition(
      clampCropPosition({
        x:
          horizontal && started.overflowX
            ? started.position.x - (deltaX / started.overflowX) * 2
            : 0,
        y:
          vertical && started.overflowY
            ? started.position.y - (deltaY / started.overflowY) * 2
            : 0,
      }),
    );
  };

  const stopDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const moveWithKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 0.2 : 0.05;
    const changes: Partial<CropPosition> = {};
    if (horizontal && event.key === "ArrowLeft") changes.x = position.x - step;
    if (horizontal && event.key === "ArrowRight") changes.x = position.x + step;
    if (vertical && event.key === "ArrowUp") changes.y = position.y - step;
    if (vertical && event.key === "ArrowDown") changes.y = position.y + step;
    if (Object.keys(changes).length === 0) return;
    event.preventDefault();
    setPosition(clampCropPosition({ ...position, ...changes }));
  };

  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const applyCrop = async () => {
    if (!sourceSize) return;
    setSaving(true);
    setError(null);
    try {
      onConfirm(await cropOutfitPhoto(file, position));
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "사진을 자르지 못했어요.",
      );
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="outfit-photo-crop-title"
      onKeyDown={trapFocus}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-lg rounded-2xl bg-background p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="outfit-photo-crop-title" className="text-lg font-semibold">
              사진 규격 맞추기
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              사진을 드래그해 3:4 테두리 안에 원하는 부분을 맞춰 주세요.
            </p>
          </div>
          <span className="shrink-0 text-sm text-muted-foreground">
            {current}/{total}
          </span>
        </div>

        <div
          ref={frameRef}
          tabIndex={0}
          aria-label="3대 4 사진 자르기 영역"
          className={`relative mx-auto mt-5 aspect-[3/4] w-full max-w-[360px] touch-none overflow-hidden rounded-xl bg-black outline-none ring-2 ring-primary ring-offset-2 ring-offset-background ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
          onPointerDown={startDrag}
          onPointerMove={movePhoto}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          onKeyDown={moveWithKeyboard}
        >
          {sourceUrl && (
            <Image
              src={sourceUrl}
              alt="자를 사진 미리보기"
              fill
              unoptimized
              draggable={false}
              className="pointer-events-none select-none object-cover"
              style={{ objectPosition }}
              onLoad={(event) =>
                setSourceSize({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                })
              }
            />
          )}
          <div className="pointer-events-none absolute inset-0 border-2 border-white/90" />
          <div className="pointer-events-none absolute inset-y-0 left-1/3 border-l border-white/45" />
          <div className="pointer-events-none absolute inset-y-0 left-2/3 border-l border-white/45" />
          <div className="pointer-events-none absolute inset-x-0 top-1/3 border-t border-white/45" />
          <div className="pointer-events-none absolute inset-x-0 top-2/3 border-t border-white/45" />
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          마우스나 손가락으로 움직일 수 있어요. 키보드는 화살표 키를 사용해
          주세요.
        </p>
        {file.type === "image/gif" && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            GIF는 첫 장면을 기준으로 잘라 정지 이미지로 저장돼요.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            disabled={saving}
            className="min-h-11 rounded-lg border border-border px-5 disabled:opacity-50"
            onClick={onCancel}
          >
            이 사진 건너뛰기
          </button>
          <button
            type="button"
            disabled={saving || !sourceSize}
            className="min-h-11 rounded-lg bg-primary px-5 text-primary-foreground disabled:opacity-50"
            onClick={() => void applyCrop()}
          >
            {saving ? "적용 중…" : "이대로 적용"}
          </button>
        </div>
      </div>
    </div>
  );
}
