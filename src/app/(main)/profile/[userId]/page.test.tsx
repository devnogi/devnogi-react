import ProfilePage, { metadata } from "./page";

it("공개 사용자 프로필을 검색엔진에 노출하지 않는다", () => {
  expect(metadata.robots).toEqual({ index: false, follow: false });
});

it("잘못된 사용자 ID는 404로 처리한다", async () => {
  await expect(
    ProfilePage({ params: Promise.resolve({ userId: "invalid" }) }),
  ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
});
