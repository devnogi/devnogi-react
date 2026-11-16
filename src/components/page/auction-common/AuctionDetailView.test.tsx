import { fireEvent, render, screen } from "@testing-library/react";

import { AuctionDetailResult } from "@/lib/auction/detail";

import AuctionDetailView from "./AuctionDetailView";

const refresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));
jest.mock("@/components/page/auction-history/ItemOptionPopover", () => {
  return function MockOptions() {
    return <div>옵션 정보</div>;
  };
});
jest.mock("@/components/page/statistics/StatisticsSummaryCards", () => {
  return function MockSummary() {
    return <div>시세 요약</div>;
  };
});
jest.mock("@/components/page/statistics/PriceChart", () => {
  return function MockPriceChart() {
    return <div>가격 차트</div>;
  };
});
jest.mock("@/components/page/statistics/VolumeChart", () => {
  return function MockVolumeChart() {
    return <div>거래량 차트</div>;
  };
});

const baseResult: AuctionDetailResult = {
  status: "available",
  source: "history",
  record: {
    itemName: "롱소드",
    itemDisplayName: "강한 롱소드",
    itemCount: 1,
    auctionPricePerUnit: 1000,
    dateAuctionBuy: "2026-11-05T10:00:00",
    auctionBuyId: "history-1",
    itemSubCategory: "검",
    itemTopCategory: "근거리 장비",
    itemOptions: [],
  },
  dailyStatistics: [],
  weeklyStatistics: [],
  itemInfoStatus: "empty",
  dailyStatus: "empty",
  weeklyStatus: "empty",
};

describe("AuctionDetailView section states", () => {
  beforeEach(() => refresh.mockClear());

  it("renders the actual realtime dateRegister field and tolerates an invalid expiry", () => {
    render(
      <AuctionDetailView
        result={{
          ...baseResult,
          source: "realtime",
          record: {
            id: 123,
            itemName: "롱소드",
            itemDisplayName: "강한 롱소드",
            itemCount: 1,
            auctionPricePerUnit: 1000,
            dateRegister: "2026-11-05T09:00:00Z",
            dateAuctionExpire: "invalid",
            itemSubCategory: "검",
            itemTopCategory: "근거리 장비",
            itemOptions: [],
          },
        }}
        returnTo="/auction-realtime?page=3"
      />,
    );
    expect(screen.getByText("등록 일시").nextElementSibling).toHaveTextContent(
      "2026",
    );
    expect(screen.getByText("만료 일시").nextElementSibling).toHaveTextContent(
      "일시 정보 없음",
    );
    expect(screen.getByRole("link", { name: /목록/ })).toHaveAttribute(
      "href",
      "/auction-realtime?page=3",
    );
  });

  it("shows retry controls for failed item info and the failed current period", () => {
    render(
      <AuctionDetailView
        result={{
          ...baseResult,
          itemInfoStatus: "error",
          dailyStatus: "error",
        }}
        returnTo="/auction-history?page=3"
      />,
    );

    expect(
      screen.getByText("아이템 정보를 불러오지 못했습니다."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("선택한 기간의 시세 정보를 불러오지 못했습니다."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("시세 데이터가 없습니다."),
    ).not.toBeInTheDocument();
    const retryButtons = screen.getAllByRole("button", { name: "다시 시도" });
    fireEvent.click(retryButtons[0]);
    fireEvent.click(retryButtons[1]);
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("shows empty messages without retry controls for successful empty responses", () => {
    render(
      <AuctionDetailView result={baseResult} returnTo="/auction-history" />,
    );

    expect(
      screen.getByText("등록된 아이템 정보가 없습니다."),
    ).toBeInTheDocument();
    expect(screen.getByText("시세 데이터가 없습니다.")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "다시 시도" }),
    ).not.toBeInTheDocument();
  });

  it("shows the status for the selected statistics period only", () => {
    render(
      <AuctionDetailView
        result={{
          ...baseResult,
          dailyStatus: "empty",
          weeklyStatus: "error",
        }}
        returnTo="/auction-history"
      />,
    );

    expect(screen.getByText("시세 데이터가 없습니다.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "최근 120일" }));
    expect(
      screen.getByText("선택한 기간의 시세 정보를 불러오지 못했습니다."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("시세 데이터가 없습니다."),
    ).not.toBeInTheDocument();
  });
});
