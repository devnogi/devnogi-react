import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import HornBugleCard from "./HornBugleCard";

function renderCard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const view = render(
    <QueryClientProvider client={client}>
      <HornBugleCard />
    </QueryClientProvider>,
  );
  return { client, ...view };
}

afterEach(() => jest.restoreAllMocks());

function envelope(items: unknown[]) {
  return {
    success: true,
    data: {
      items,
      meta: {
        currentPage: 1,
        pageSize: 7,
        totalPages: 1,
        totalElements: items.length,
        isFirst: true,
        isLast: true,
      },
    },
  };
}

it("전체 서버의 최신 메시지를 기존 API 순서대로 최대 7건 표시한다", async () => {
  jest
    .spyOn(Date, "now")
    .mockReturnValue(Date.parse("2026-11-03T12:08:35+09:00"));
  const items = Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    serverName: index % 2 ? "울프" : "류트",
    characterName: `캐릭터 ${index + 1}`,
    message: `메시지 ${index + 1}`,
    dateSend: `2026-11-03T12:0${7 - index}:00Z`,
    dateRegister: "2026-11-03T13:00:00Z",
  }));
  const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    json: async () => envelope(items),
  } as Response);
  renderCard();
  await screen.findByText("메시지 1");
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith("/api/horn-bugle?page=1&size=7", {
    cache: "no-store",
    signal: expect.any(AbortSignal),
  });
  expect(screen.getAllByText("류트")).toHaveLength(4);
  expect(screen.getByText("캐릭터 1")).toBeInTheDocument();
  expect(screen.getByText("1분 전")).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "거대한 뿔피리" }),
  ).toHaveAttribute("title", "마지막 조회시각 12:08:35");
  expect(
    screen.queryByText("에린에서 지금 들려오는 이야기"),
  ).not.toBeInTheDocument();
  expect(screen.queryByText(/^마지막 조회/)).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "새로고침" }),
  ).not.toBeInTheDocument();
  expect(screen.queryByText("메시지 8")).not.toBeInTheDocument();
  expect(
    screen
      .getByText("메시지 1")
      .compareDocumentPosition(screen.getByText("메시지 7")) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});

it("빈 응답을 표시한다", async () => {
  jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    json: async () => envelope([]),
  } as Response);
  renderCard();
  expect(await screen.findByText("뿔피리 내역이 없습니다")).toBeInTheDocument();
});

it("첫 실패를 빈 결과와 구분하고 명시적 재시도로 복구한다", async () => {
  const fetchMock = jest
    .spyOn(global, "fetch")
    .mockResolvedValue({ ok: false, status: 500 } as Response);
  renderCard();
  expect(
    await screen.findByText("데이터를 불러올 수 없습니다"),
  ).toBeInTheDocument();
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  expect(screen.queryByText("뿔피리 내역이 없습니다")).not.toBeInTheDocument();
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => envelope([]),
  } as Response);
  fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
  expect(await screen.findByText("뿔피리 내역이 없습니다")).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "거대한 뿔피리" }),
  ).toHaveAttribute(
    "title",
    expect.stringMatching(/^마지막 조회시각 \d{2}:\d{2}:\d{2}$/),
  );
});

it("자동 갱신 실패 시 기존 메시지와 마지막 성공 시각을 유지한다", async () => {
  const item = {
    id: 1,
    serverName: "류트",
    characterName: "테스터",
    message: "유지할 메시지",
    dateSend: "2026-11-14T12:00:00Z",
    dateRegister: "2026-11-14T12:00:00Z",
  };
  const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    json: async () => envelope([item]),
  } as Response);
  const { client } = renderCard();
  await screen.findByText("유지할 메시지");
  const heading = screen.getByRole("heading", { name: "거대한 뿔피리" });
  const checkedAt = heading.getAttribute("title");
  fetchMock.mockResolvedValue({ ok: false, status: 503 } as Response);
  await client.refetchQueries({ queryKey: ["horn-bugle", "home", 7] });
  await screen.findByText(
    "최신 정보를 확인하지 못했습니다. 기존 메시지를 표시합니다.",
  );
  expect(screen.getByText("유지할 메시지")).toBeInTheDocument();
  expect(heading).toHaveAttribute("title", checkedAt);
  expect(
    screen.queryByRole("button", { name: "새로고침" }),
  ).not.toBeInTheDocument();
});
