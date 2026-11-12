"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { heroRequest } from "@/lib/hero/request";
import type { HeroResponse, HeroSlide } from "@/types/hero";

const fallback: HeroSlide = {
  id: 0,
  imageUrl: "/home-hero-library-v2.png",
  altText: "마비노기 정보 검색",
  linkUrl: null,
  position: 1,
  advertisement: false,
  startsAt: null,
  endsAt: null,
};

export function useHero() {
  const query = useQuery({
    queryKey: ["hero", "public"],
    queryFn: () => heroRequest<HeroResponse>("hero"),
    refetchInterval: 30_000,
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
    retry: false,
  });
  const [now, setNow] = useState(Date.now);
  const { data, refetch, dataUpdatedAt } = query;
  // Advance the server clock locally even when a refresh fails.
  const serverNow = data
    ? Date.parse(data.serverTime) + Math.max(0, now - dataUpdatedAt)
    : now;
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    const visible = () => {
      if (!document.hidden) {
        setNow(Date.now());
        void refetch();
      }
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [refetch]);
  useEffect(() => {
    if (!data?.nextChangeAt) return;
    const delay =
      Date.parse(data.nextChangeAt) -
      (Date.parse(data.serverTime) + Math.max(0, Date.now() - dataUpdatedAt));
    if (delay <= 0) return;
    const timer = window.setTimeout(
      () => {
        setNow(Date.now());
        void refetch();
      },
      Math.min(delay + 25, 2_147_483_647),
    );
    return () => window.clearTimeout(timer);
  }, [data, dataUpdatedAt, refetch]);
  const items =
    data?.items
      .filter(
        (slide) =>
          (!slide.startsAt || Date.parse(slide.startsAt) <= serverNow) &&
          (!slide.endsAt || Date.parse(slide.endsAt) > serverNow),
      )
      .slice(0, 10) ?? [];
  if (items[0]?.advertisement && items[0].position === 2)
    items.unshift(fallback);
  return items.length ? items : [fallback];
}
