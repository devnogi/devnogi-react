import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { useItemOptionInfos } from "./useItemOptionInfos";

const item = { optionType: "공격력", optionValue: "10" };

function queryOptions(payload: unknown) {
  jest.spyOn(global, "fetch").mockResolvedValue(Response.json(payload));
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return renderHook(useItemOptionInfos, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  }).result;
}

afterEach(() => jest.restoreAllMocks());

it.each([
  { data: { success: true, data: [item] }, expected: [item] },
  { data: [item], expected: [item] },
  { data: { success: true, data: [] }, expected: [] },
])("성공 응답에서 옵션 목록을 읽는다", async ({ data, expected }) => {
  const result = queryOptions({ success: true, data });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toEqual(expected);
});

it.each([
  { success: false },
  { success: true, data: { success: false, data: [] } },
  { success: true, data: { success: true, data: {} } },
])("오류 응답을 빈 목록과 구분한다", async (payload) => {
  const result = queryOptions(payload);
  await waitFor(() => expect(result.current.isError).toBe(true));
});
