import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import GuildFeed from "./GuildFeed";
import type { Guild } from "./shared";
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isLoading: false, user: { userId: 12 } }),
}));
const entry = {
  id: 2,
  title: "길드원 모집",
  body: "함께해요",
  status: "OPEN",
  authorId: 20,
};
function mount(role: string | null) {
  const guild = {
    id: 3,
    server: "류트",
    viewerRole: role,
    recruitments: [entry],
    posts: [],
  } as unknown as Guild;
  render(
    <QueryClientProvider client={new QueryClient()}>
      <GuildFeed base="guilds/3" guild={guild} kind="recruitments" />
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  // jest-fixed-jsdom installs Node's FormData; browser forms use the DOM constructor.
  const frame = document.createElement("iframe");
  document.body.appendChild(frame);
  global.FormData = (
    frame.contentWindow as Window & typeof globalThis
  ).FormData;
  frame.remove();
  jest.spyOn(clientAxios, "request").mockImplementation(async (config) => ({
    status: 200,
    data: {
      success: true,
      data:
        config.url === "/user/verification/info"
          ? { verified: true, serverName: "류트" }
          : [],
    },
  }));
});
it("인증된 같은 서버 방문자가 모집글에 지원한다", async () => {
  mount(null);
  fireEvent.click(await screen.findByRole("button", { name: "지원하기" }));
  await waitFor(() =>
    expect(clientAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "/guilds/3/recruitments/2/applications",
        headers: { "X-Guild-Action": "1" },
      }),
    ),
  );
  expect(screen.queryByText("모집글 작성")).not.toBeInTheDocument();
});
it("부마스터에게 모집 편집과 심사 기능을 표시한다", async () => {
  mount("DEPUTY");
  expect(await screen.findByText("모집글 작성")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "지원자 보기" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "지원하기" }),
  ).not.toBeInTheDocument();
});
import { clientAxios } from "@/lib/api/clients";
