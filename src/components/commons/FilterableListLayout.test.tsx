import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";

import FilterableListLayout from "./FilterableListLayout";

jest.mock("@/hooks/useItemCategories", () => {
  const categories = [
    {
      id: "all",
      name: "전체",
      children: [{ id: "melee", name: "근거리 장비" }],
    },
  ];
  return { useItemCategories: () => ({ data: categories, isLoading: false }) };
});

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
jest.mock("@/components/commons/Category", () => {
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

jest.mock("@/components/commons/Search", () => {
  return function MockAuctionSearch() {
    return <span data-testid="auction-search" />;
  };
});

function ComponentWrapper({
  children,
  categoryStorageKey,
}: {
  children: React.ReactNode;
  categoryStorageKey: string;
}) {
  const [category, setCategory] = useState<string>("all");
  const [itemName, setItemName] = useState<string>("");
  return (
    <FilterableListLayout
      categoryStorageKey={categoryStorageKey}
      selectedCategory={category}
      setSelectedCategory={setCategory}
      itemName={itemName}
      setItemName={setItemName}
    >
      {children}
    </FilterableListLayout>
  );
}

describe("FilterableListLayout", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReset();
    localStorageMock.setItem.mockClear();
  });

  it("컴포넌트 렌더링 테스트", () => {
    render(
      <ComponentWrapper categoryStorageKey="testKey">
        <span data-testid="child-content" />
      </ComponentWrapper>,
    );

    // 컴포넌트 렌더링 확인
    expect(screen.getByTestId("auction-search")).toBeInTheDocument();
    expect(screen.getByTestId("auction-category")).toBeInTheDocument();
    expect(screen.getByTestId("child-content")).toBeInTheDocument(); // Check for children

    // localStorage 초기값 확인
    expect(localStorageMock.getItem).toHaveBeenCalledWith("testKey");
    expect(screen.getByTestId("selected-id")).toHaveTextContent("all");
  });

  it("localStorage 관련 테스트", async () => {
    localStorageMock.getItem.mockReturnValue("melee");

    render(
      <ComponentWrapper categoryStorageKey="testKey">
        <span data-testid="child-content" />
      </ComponentWrapper>,
    );

    // 초기값 테스트
    await waitFor(() => {
      expect(localStorageMock.getItem).toHaveBeenCalledWith("testKey");
      expect(screen.getByTestId("selected-id")).toHaveTextContent("melee");
    });

    // 카테고리 선택 테스트
    const meleeButton = screen.getByText("로컬 스토리지 저장");
    fireEvent.click(meleeButton);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith("testKey", "saved");
    });
  });
});
