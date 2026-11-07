import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import Directory from "./Directory";
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isLoading: false, user: { userId: 7 } }),
}));
it("인증 서버는 읽기 전용이고 등록 내역에서 승인된 길드홈으로 이동할 수 있다", async () => {
  const responses: Record<string, unknown> = {
    "user/verification/info": {
      verified: true,
      serverName: "하프",
      characterName: "길드원",
    },
    "guilds/registrations": [
      { id: 8, name: "테스트길드", status: "APPROVED", guildId: 9 },
    ],
  };
  jest.spyOn(clientAxios, "request").mockImplementation(async (config) => ({
    status: 200,
    data: {
      success: true,
      data: responses[String(config.url).slice(1)] ?? [],
    },
  }));
  render(
    <QueryClientProvider client={new QueryClient()}>
      <Directory />
    </QueryClientProvider>,
  );
  const server = await screen.findByRole("textbox", { name: "인증 서버" });
  expect(server).toHaveValue("하프");
  expect(server).toHaveAttribute("readonly");
  expect(await screen.findByRole("link", { name: "길드홈" })).toHaveAttribute(
    "href",
    "/guilds/9",
  );
});
import { clientAxios } from "@/lib/api/clients";
