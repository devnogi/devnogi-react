import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";

import HornBugleCard from "./HornBugleCard";

function renderCard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <HornBugleCard />
    </QueryClientProvider>,
  );
}

afterEach(() => jest.restoreAllMocks());

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
    json: async () => ({ data: { items } }),
  } as Response);
  renderCard();
  await screen.findByText("메시지 1");
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith("/api/horn-bugle?page=1&size=7");
  expect(screen.getAllByText("류트")).toHaveLength(4);
  expect(screen.getByText("캐릭터 1")).toBeInTheDocument();
  expect(screen.getByText("1분 전")).toBeInTheDocument();
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
    json: async () => ({ data: { items: [] } }),
  } as Response);
  renderCard();
  expect(await screen.findByText("뿔피리 내역이 없습니다")).toBeInTheDocument();
});

it("실패 시 오류 상태를 표시하고 재시도하지 않는다", async () => {
  const fetchMock = jest
    .spyOn(global, "fetch")
    .mockResolvedValue({ ok: false, status: 500 } as Response);
  renderCard();
  expect(
    await screen.findByText("데이터를 불러올 수 없습니다"),
  ).toBeInTheDocument();
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
});
