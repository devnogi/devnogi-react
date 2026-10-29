import { createQueryClient } from "./query-client";

it("서버 렌더링 요청 간에 TanStack Query 캐시를 공유하지 않는다", () => {
  const firstClient = createQueryClient();
  const secondClient = createQueryClient();
  const queryKey = ["post", 42, "public:2026-10-29T00:00:00.000Z"];

  firstClient.setQueryData(queryKey, { title: "첫 요청의 공개 글" });

  expect(secondClient.getQueryData(queryKey)).toBeUndefined();
});
