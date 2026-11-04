"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDE_INTERVAL_MS = 7_000;

const heroSlides = [
  {
    src: "/home-hero-library-v2.png",
    position: "object-[35%_60%] md:object-[center_68%]",
  },
  {
    src: "/home-hero-winter.png",
    position: "object-[50%_55%] md:object-center",
  },
];

export default function HomeHeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    );

    if (reducedMotion?.matches) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [activeSlide]);

  const showPreviousSlide = () => {
    setActiveSlide(
      (current) => (current - 1 + heroSlides.length) % heroSlides.length,
    );
  };

  const showNextSlide = () => {
    setActiveSlide((current) => (current + 1) % heroSlides.length);
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {heroSlides.map(({ src, position }, index) => {
        const isActive = activeSlide === index;

        return (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            data-testid="hero-slide"
            data-active={isActive ? "true" : "false"}
            className={clsx(
              "object-cover brightness-[.62] saturate-[.78] transition-opacity duration-[1200ms] ease-in-out motion-reduce:transition-none",
              position,
              isActive ? "opacity-100" : "opacity-0",
            )}
          />
        );
      })}

      <button
        type="button"
        onClick={showPreviousSlide}
        aria-label="이전 Hero 이미지"
        className="absolute bottom-4 left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-gray-950/45 text-white shadow-[0_8px_24px_rgba(0,0,0,0.24)] backdrop-blur-sm transition-[background-color,transform] hover:scale-105 hover:bg-[#b9502b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:top-1/2 md:bottom-auto md:left-6 md:h-11 md:w-11 md:-translate-y-1/2"
      >
        <ChevronLeft aria-hidden="true" className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={showNextSlide}
        aria-label="다음 Hero 이미지"
        className="absolute right-3 bottom-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-gray-950/45 text-white shadow-[0_8px_24px_rgba(0,0,0,0.24)] backdrop-blur-sm transition-[background-color,transform] hover:scale-105 hover:bg-[#b9502b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:top-1/2 md:right-6 md:bottom-auto md:h-11 md:w-11 md:-translate-y-1/2"
      >
        <ChevronRight aria-hidden="true" className="h-5 w-5" />
      </button>
    </div>
  );
}
