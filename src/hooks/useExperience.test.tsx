import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";

import { clientAxios } from "@/lib/api/clients";
import { experienceSummaryFixture } from "@/mocks/data/experience";

import { useExperience } from "./useExperience";

jest.mock("@/lib/api/clients", () => ({ clientAxios: { get: jest.fn() } }));

it("refreshes the bidding wallet when another user releases its reservation", async () => {
  jest.useFakeTimers();
  const get = jest.mocked(clientAxios.get);
  get.mockResolvedValueOnce({
    data: {
      success: true,
      data: { ...experienceSummaryFixture, reservedXp: 70, availableXp: 0 },
    },
  });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { result, unmount } = renderHook(
    () => useExperience(7, { refetchInterval: 30_000 }),
    { wrapper },
  );
  await act(async () => {
    await jest.advanceTimersByTimeAsync(1);
  });
  expect(result.current.data?.availableXp).toBe(0);
  get.mockResolvedValueOnce({
    data: {
      success: true,
      data: { ...experienceSummaryFixture, reservedXp: 0, availableXp: 70 },
    },
  });
  await act(async () => {
    await jest.advanceTimersByTimeAsync(30_001);
  });
  expect(result.current.data?.availableXp).toBe(70);
  expect(result.current.data?.reservedXp).toBe(0);
  unmount();
  client.clear();
  jest.useRealTimers();
});
