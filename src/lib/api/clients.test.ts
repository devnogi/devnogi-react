import { clientAxios } from "./clients";

it("OAuth 교환의 요청 코드와 가입 증명을 콘솔에 남기지 않는다", async () => {
  const logs = [
    jest.spyOn(console, "log").mockImplementation(() => {}),
    jest.spyOn(console, "group").mockImplementation(() => {}),
    jest.spyOn(console, "groupEnd").mockImplementation(() => {}),
  ];
  try {
    await clientAxios.post("/auth/oauth/exchange", { code: "synthetic-secret-code" }, {
      adapter: async config => ({
        config, status: 200, statusText: "OK", headers: {},
        data: { success: true, data: { signupProof: "synthetic-secret-proof" } },
      }),
    });
    expect(logs.flatMap(spy => spy.mock.calls).flat().join(" ")).not.toMatch(/synthetic-secret-code|synthetic-secret-proof/);
  } finally {
    logs.forEach(spy => spy.mockRestore());
  }
});

it("소셜 가입 실패 응답에도 가입 증명을 콘솔에 남기지 않는다", async () => {
  const logs = [
    jest.spyOn(console, "log").mockImplementation(() => {}),
    jest.spyOn(console, "group").mockImplementation(() => {}),
    jest.spyOn(console, "groupEnd").mockImplementation(() => {}),
  ];
  const body = new FormData();
  body.set("signupProof", "synthetic-secret-proof");
  try {
    await expect(clientAxios.post("/auth/signup/social", body, {
      adapter: async config => Promise.reject({
        config, message: "synthetic-secret-proof", response: { status: 400, data: { message: "synthetic-secret-proof" } },
      }),
    })).rejects.toBeDefined();
    expect(logs.flatMap(spy => spy.mock.calls).flat().join(" ")).not.toContain("synthetic-secret-proof");
  } finally {
    logs.forEach(spy => spy.mockRestore());
  }
});
