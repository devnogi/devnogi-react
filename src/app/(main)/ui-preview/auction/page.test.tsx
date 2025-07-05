import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Page from "./page";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock components
jest.mock("@/components/page/auction/Category", () => {
  return function MockAuctionCategory({
    selectedId,
    onSelect,
  }: {
    selectedId: string;
    onSelect: (id: string) => void;
  }) {
    return (
      <div data-testid="auction-category">
        <span data-testid="selected-id">{selectedId}</span>
        <button onClick={() => onSelect("saved")}>로컬 스토리지 저장</button>
      </div>
    );
  };
});

jest.mock("@/components/page/auction/Search", () => {
  return function MockAuctionSearch() {
    return <span data-testid="auction-search" />;
  };
});

jest.mock("@/components/page/auction/List", () => {
  return function MockAuctionList() {
    return <span data-testid="auction-list" />;
  };
});

describe("Auction Page", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  it("컴포넌트 렌더링 테스트", () => {
    render(<Page />);

    // 컴포넌트 렌더링 확인
    expect(screen.getByTestId("auction-search")).toBeInTheDocument();
    expect(screen.getByTestId("auction-category")).toBeInTheDocument();
    expect(screen.getByTestId("auction-list")).toBeInTheDocument();

    // localStorage 초기값 확인
    expect(localStorageMock.getItem).toHaveBeenCalledWith(
      "lastSelectedCategory",
    );
    expect(screen.getByTestId("selected-id")).toHaveTextContent("all");
  });

  it("localStorage 관련 테스트", async () => {
    localStorageMock.getItem.mockReturnValue("melee");

    render(<Page />);

    // 초기값 테스트
    await waitFor(() => {
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        "lastSelectedCategory",
      );
      expect(screen.getByTestId("selected-id")).toHaveTextContent("melee");
    });

    // 카테고리 선택 테스트
    const meleeButton = screen.getByText("로컬 스토리지 저장");
    fireEvent.click(meleeButton);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "lastSelectedCategory",
        "saved",
      );
    });
  });
});
