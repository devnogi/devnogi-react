"use client";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { useHero } from "@/hooks/useHero";
import { validateHeroLink } from "@/lib/hero/validation";

import styles from "./HomeHeroCarousel.module.css";
function safeLink(value: string | null) {
  try {
    return validateHeroLink(value ?? "");
  } catch {
    return null;
  }
}
export default function HomeHeroCarousel() {
  const slides = useHero();
  const [activeSlide, setActiveSlide] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const active = activeSlide % slides.length;
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query?.matches ?? false);
    sync();
    query?.addEventListener?.("change", sync);
    return () => query?.removeEventListener?.("change", sync);
  }, []);
  useEffect(() => {
    if (paused || reducedMotion || slides.length < 2) return;
    const timer = window.setInterval(
      () => setActiveSlide((current) => (current + 1) % slides.length),
      7000,
    );
    return () => window.clearInterval(timer);
  }, [activeSlide, paused, reducedMotion, slides.length]);
  const move = (direction: number) =>
    setActiveSlide(
      (current) => (current + direction + slides.length) % slides.length,
    );
  return (
    <div className="absolute inset-0 overflow-hidden">
      {slides.map((slide, index) => {
        const failed = failedImages.includes(slide.imageUrl);
        const link = failed ? null : safeLink(slide.linkUrl);
        return (
          <div
            key={`${slide.id}-${slide.position}`}
            className={clsx(
              "absolute inset-0",
              index !== active && "pointer-events-none",
            )}
            aria-hidden={index !== active}
          >
            <Image
              src={failed ? "/home-hero-library-v2.png" : slide.imageUrl}
              alt={slide.altText}
              fill
              priority={index === 0}
              unoptimized={!slide.imageUrl.startsWith("/")}
              onError={() =>
                setFailedImages((current) =>
                  current.includes(slide.imageUrl)
                    ? current
                    : [...current, slide.imageUrl],
                )
              }
              sizes="100vw"
              data-testid="hero-slide"
              data-active={index === active ? "true" : "false"}
              className={clsx(
                styles.image,
                index === active ? "opacity-100" : "opacity-0",
              )}
            />
            {link && index === active ? (
              <a
                href={link}
                className="absolute inset-0 z-10 focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-ring"
                aria-label={slide.altText || "광고 링크 이동"}
              />
            ) : null}
            {slide.advertisement && !failed && index === active ? (
              <span className="absolute top-3 left-4 z-10 rounded bg-black/60 px-2 py-1 text-xs text-white">
                광고
              </span>
            ) : null}
          </div>
        );
      })}
      <div
        className={styles.controls}
        role="group"
        aria-label="Hero 이미지 전환"
        onKeyDown={(event) => {
          if (
            slides.length > 1 &&
            (event.key === "ArrowLeft" || event.key === "ArrowRight")
          ) {
            event.preventDefault();
            move(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        <button
          type="button"
          disabled={slides.length < 2}
          onClick={() => move(-1)}
          aria-label="이전 Hero 이미지"
        >
          <ChevronLeft size={18} />
        </button>
        <span aria-live={paused || reducedMotion ? "polite" : "off"}>
          {active + 1}
          <span> / {slides.length}</span>
        </span>
        <button
          type="button"
          disabled={slides.length < 2}
          onClick={() => move(1)}
          aria-label="다음 Hero 이미지"
        >
          <ChevronRight size={18} />
        </button>
        <button
          type="button"
          onClick={() => setPaused((current) => !current)}
          disabled={reducedMotion || slides.length < 2}
          aria-label={
            reducedMotion
              ? "모션 감소 설정으로 자동 전환 정지"
              : paused
                ? "Hero 자동 전환 재개"
                : "Hero 자동 전환 정지"
          }
          aria-pressed={paused || reducedMotion || slides.length < 2}
        >
          {paused || reducedMotion || slides.length < 2 ? (
            <Play size={16} />
          ) : (
            <Pause size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
