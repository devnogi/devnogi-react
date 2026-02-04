"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import clsx from "clsx";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={clsx(
        "fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full",
        "bg-white dark:bg-navy-700 border border-gray-200 dark:border-navy-500 shadow-lg dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)]",
        "flex items-center justify-center",
        "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-coral-400 hover:border-blue-300 dark:hover:border-coral-500",
        "transition-all duration-300 transform",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
      )}
      aria-label="맨 위로 이동"
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  );
}
