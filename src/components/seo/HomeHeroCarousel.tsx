"use client";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "./HomeHeroCarousel.module.css";
const heroSlides = [
  { src: "/home-hero-library-v2.png", position: styles.library },
  { src: "/home-hero-winter.png", position: styles.winter },
];
export default function HomeHeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query?.matches ?? false);
    sync();
    query?.addEventListener?.("change", sync);
    return () => query?.removeEventListener?.("change", sync);
  }, []);
  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = window.setInterval(
      () => setActiveSlide((current) => (current + 1) % heroSlides.length),
      7000,
    );
    return () => window.clearInterval(timer);
  }, [activeSlide, paused, reducedMotion]);
  const move = (direction: number) =>
    setActiveSlide(
      (current) =>
        (current + direction + heroSlides.length) % heroSlides.length,
    );
  return (
    <div className="absolute inset-0 overflow-hidden">
      {heroSlides.map(({ src, position }, index) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={index === 0}
          sizes="100vw"
          data-testid="hero-slide"
          data-active={index === activeSlide ? "true" : "false"}
          className={clsx(
            styles.image,
            position,
            index === activeSlide ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
      <div
        className={styles.controls}
        role="group"
        aria-label="Hero 이미지 전환"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            move(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="이전 Hero 이미지"
        >
          <ChevronLeft size={18} />
        </button>
        <span aria-live={paused || reducedMotion ? "polite" : "off"}>
          {activeSlide + 1}
          <span> / {heroSlides.length}</span>
        </span>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="다음 Hero 이미지"
        >
          <ChevronRight size={18} />
        </button>
        <button
          type="button"
          onClick={() => setPaused((current) => !current)}
          disabled={reducedMotion}
          aria-label={
            reducedMotion
              ? "모션 감소 설정으로 자동 전환 정지"
              : paused
                ? "Hero 자동 전환 재개"
                : "Hero 자동 전환 정지"
          }
          aria-pressed={paused || reducedMotion}
        >
          {paused || reducedMotion ? <Play size={16} /> : <Pause size={16} />}
        </button>
      </div>
    </div>
  );
}
