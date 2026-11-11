import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import { clientAxios } from "@/lib/api/clients";
import {
  experienceHistoryFixture,
  experienceSummaryFixture,
} from "@/mocks/data/experience";

import ExperiencePanel from "./ExperiencePanel";

jest.mock("@/lib/api/clients", () => ({ clientAxios: { get: jest.fn() } }));

const get = jest.mocked(clientAxios.get);
function mount(userId = 7) {
  const cache = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const result = render(
    <QueryClientProvider client={cache}>
      <ExperiencePanel userId={userId} />
    </QueryClientProvider>,
  );
  return { cache, ...result };
}

beforeEach(() => {
  get.mockReset();
  get.mockImplementation(async (path) => ({
    data: {
      success: true,
      data:
        path === "/user/experience"
          ? experienceSummaryFixture
          : experienceHistoryFixture,
    },
  }));
});

it("현재 등급과 다음 등급까지의 진행률, 부호 있는 회수 이력과 기준표를 표시한다", async () => {
  const { cache } = mount();
  expect(await screen.findByLabelText("활동 등급: 수석")).toBeInTheDocument();
  expect(screen.getByText("달인까지 180 XP 남았습니다.")).toBeInTheDocument();
  expect(screen.getByRole("progressbar")).toHaveAttribute("value", "12.2");
  expect(await screen.findByText("-5 XP")).toBeInTheDocument();
  expect(screen.getByText("+20 XP")).toBeInTheDocument();
  fireEvent.click(screen.getByText("등급 기준 보기"));
  expect(
    within(screen.getByRole("table")).getByText("5,000 XP"),
  ).toBeInTheDocument();
  expect(cache.getQueryData(["experience", 7, "summary"])).toEqual(
    experienceSummaryFixture,
  );
  expect(cache.getQueryData(["experience", 8, "summary"])).toBeUndefined();
});

it("서버 커서로 다음 이력을 가져오며 마지막 페이지에서는 더 보기 버튼을 없앤다", async () => {
  get.mockImplementation(async (path, config) => ({
    data: {
      success: true,
      data:
        path === "/user/experience"
          ? experienceSummaryFixture
          : config?.params?.cursor
            ? {
                items: [
                  {
                    ...experienceHistoryFixture.items[0],
                    id: 1,
                    activityName: "최초 댓글",
                    deltaXp: 5,
                  },
                ],
                nextCursor: null,
              }
            : experienceHistoryFixture,
    },
  }));
  mount();
  fireEvent.click(await screen.findByRole("button", { name: "이력 더 보기" }));
  expect(await screen.findByText("최초 댓글")).toBeInTheDocument();
  expect(get).toHaveBeenCalledWith("/user/experience/history", {
    params: { cursor: 2, size: 20 },
  });
  expect(
    screen.queryByRole("button", { name: "이력 더 보기" }),
  ).not.toBeInTheDocument();
  expect(screen.getAllByText("댓글 작성")).toHaveLength(1);
});

it("인증 상실 시 잔액과 이력을 보존해서 보여주고 등급과 진행률은 숨긴다", async () => {
  get.mockImplementation(async (path) => ({
    data: {
      success: true,
      data:
        path === "/user/experience"
          ? {
              ...experienceSummaryFixture,
              eligible: false,
              activityGrade: null,
            }
          : experienceHistoryFixture,
    },
  }));
  mount();
  expect(
    await screen.findByRole("link", { name: "캐릭터 인증하기" }),
  ).toHaveAttribute("href", "/mypage?tab=verification");
  expect(screen.getByText("70")).toBeInTheDocument();
  expect(screen.queryByLabelText("활동 등급: 수석")).not.toBeInTheDocument();
  expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  expect(await screen.findByText("-5 XP")).toBeInTheDocument();
});

it("그랜드마스터는 최고 등급과 완료된 진행률을 표시한다", async () => {
  get.mockImplementation(async (path) => ({
    data: {
      success: true,
      data:
        path === "/user/experience"
          ? {
              ...experienceSummaryFixture,
              totalXp: 5000,
              activityGrade: "GRANDMASTER",
              nextGrade: null,
              nextGradeMinXp: null,
              xpToNextGrade: 0,
              progressPercent: 100,
            }
          : { items: [], nextCursor: null },
    },
  }));
  mount();
  expect(
    await screen.findByText("최고 등급인 그랜드마스터를 달성했습니다."),
  ).toBeInTheDocument();
  expect(screen.getByRole("progressbar")).toHaveAttribute("value", "100");
  expect(
    await screen.findByText("아직 경험치 이력이 없습니다."),
  ).toBeInTheDocument();
});

it("실패를 0 XP로 오인하지 않고 새로고침으로 복구한다", async () => {
  get.mockRejectedValue(new Error("offline"));
  mount();
  expect(await screen.findAllByRole("alert")).toHaveLength(2);
  expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  get.mockImplementation(async (path) => ({
    data: {
      success: true,
      data:
        path === "/user/experience"
          ? experienceSummaryFixture
          : { items: [], nextCursor: null },
    },
  }));
  fireEvent.click(screen.getByRole("button", { name: "새로고침" }));
  expect(await screen.findByLabelText("활동 등급: 수석")).toBeInTheDocument();
  await waitFor(() =>
    expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
  );
});
