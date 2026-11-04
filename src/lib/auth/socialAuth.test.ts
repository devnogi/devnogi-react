import { getPendingSocialSignup, savePendingSocialSignup } from "./socialAuth";

beforeEach(() => {
  sessionStorage.clear();
  jest.restoreAllMocks();
});

it("가입 증명은 현재 탭의 세션 저장소에서만 복원한다", () => {
  savePendingSocialSignup({
    provider: "google",
    email: "user@example.test",
    signupProof: "synthetic-proof",
    createdAt: Date.now(),
  });

  expect(getPendingSocialSignup()).toEqual(
    expect.objectContaining({
      provider: "google",
      email: "user@example.test",
      signupProof: "synthetic-proof",
    }),
  );
});

it("5분이 지난 가입 증명은 폐기한다", () => {
  const now = Date.now();
  const nowSpy = jest.spyOn(Date, "now").mockReturnValue(now);
  savePendingSocialSignup({
    provider: "naver",
    signupProof: "synthetic-proof",
    createdAt: now,
  });

  nowSpy.mockReturnValue(now + 5 * 60 * 1000);

  expect(getPendingSocialSignup()).toBeNull();
});
