import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";

import { heroRequest } from "@/lib/hero/request";
import type { HeroResponse } from "@/types/hero";

import { useHero } from "./useHero";

jest.mock("@/lib/hero/request", () => ({ heroRequest: jest.fn() }));
const request = jest.mocked(heroRequest);
const at = "2026-11-15T15:00:00.000Z";
const base = {
  id: 1,
  imageUrl: "/image.png",
  altText: "광고",
  linkUrl: null,
  position: 1,
  advertisement: true,
  startsAt: null,
  endsAt: "2026-11-15T15:00:05.000Z",
};
function mount(data?: HeroResponse) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  if (data) client.setQueryData(["hero", "public"], data);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { ...renderHook(() => useHero(), { wrapper }), client };
}
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(at));
  request.mockReset();
  request.mockRejectedValue(new Error("offline"));
});
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

it("expires an advertisement even if the boundary refetch fails", async () => {
  const { result } = mount({
    items: [base],
    nextChangeAt: base.endsAt,
    serverTime: at,
  });
  expect(result.current[0].advertisement).toBe(true);
  await act(async () => {
    jest.advanceTimersByTime(6000);
  });
  expect(result.current).toHaveLength(1);
  expect(result.current[0].advertisement).toBe(false);
  expect(request).toHaveBeenCalledWith("hero");
});

it("preserves second slot and filters future and expired rows", () => {
  const { result } = mount({
    items: [
      { ...base, endsAt: at },
      { ...base, id: 2, position: 2, endsAt: null },
      { ...base, id: 3, startsAt: "2026-11-16T00:00:00Z", endsAt: null },
    ],
    nextChangeAt: null,
    serverTime: at,
  });
  expect(result.current.map((slide) => slide.position)).toEqual([1, 2]);
  expect(result.current[0].advertisement).toBe(false);
});

it("renders one safe default without a successful response", () => {
  const { result } = mount();
  expect(result.current).toHaveLength(1);
  expect(result.current[0].imageUrl).toBe("/home-hero-library-v2.png");
});
