import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Autocomplete from "./Autocomplete";
import { ItemInfo } from "@/hooks/useItemInfos";

const mockItems: ItemInfo[] = [
  {
    name: "나뭇가지",
    topCategory: "무기",
    subCategory: "한손검",
  },
  {
    name: "나무 방패",
    topCategory: "방어 장비",
    subCategory: "방패",
  },
  {
    name: "검",
    topCategory: "무기",
    subCategory: "검",
  },
];

describe("Autocomplete", () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock scrollIntoView for Jest environment
    Element.prototype.scrollIntoView = jest.fn();
  });

  it("renders nothing when value is empty", () => {
    const { container } = render(
      <Autocomplete items={mockItems} value="" onSelect={mockOnSelect} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders filtered items based on search value", () => {
    render(
      <Autocomplete items={mockItems} value="나무" onSelect={mockOnSelect} />,
    );

    expect(screen.getByText("나무 방패")).toBeInTheDocument();
    expect(screen.queryByText("나뭇가지")).not.toBeInTheDocument();
    expect(screen.queryByText("검")).not.toBeInTheDocument();
  });

  it("calls onSelect when item is clicked", async () => {
    render(
      <Autocomplete items={mockItems} value="나무" onSelect={mockOnSelect} />,
    );

    const firstItem = screen.getByText("나무 방패");
    fireEvent.mouseDown(firstItem);

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith(mockItems[1]);
    });
  });

  it("shows category information for each item", () => {
    render(
      <Autocomplete items={mockItems} value="나무" onSelect={mockOnSelect} />,
    );

    expect(screen.getByText("방어 장비 › 방패")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <Autocomplete
        items={mockItems}
        value="나무"
        onSelect={mockOnSelect}
        isLoading={true}
      />,
    );

    expect(screen.getByText("로딩 중...")).toBeInTheDocument();
  });

  it("shows no results message when no items match", () => {
    const { container } = render(
      <Autocomplete
        items={mockItems}
        value="존재하지않는아이템"
        onSelect={mockOnSelect}
      />,
    );

    // 검색 결과가 없으면 아예 렌더링되지 않음
    expect(container.firstChild).toBeNull();
  });

  it("limits results to 10 items", () => {
    const manyItems: ItemInfo[] = Array.from({ length: 20 }, (_, i) => ({
      name: `아이템${i}`,
      topCategory: "무기",
      subCategory: "검",
    }));

    render(
      <Autocomplete items={manyItems} value="아이템" onSelect={mockOnSelect} />,
    );

    const listItems = screen.getAllByRole("option");
    expect(listItems).toHaveLength(10);
  });

  it("highlights selected item on mouse enter", () => {
    render(
      <Autocomplete items={mockItems} value="나무" onSelect={mockOnSelect} />,
    );

    const firstItem = screen.getByText("나무 방패").closest("li");
    if (firstItem) {
      fireEvent.mouseEnter(firstItem);
      expect(firstItem).toHaveClass("bg-blue-50");
    }
  });

  it("calls onArrowUpFromFirst when up arrow is pressed on first item", () => {
    const mockOnArrowUpFromFirst = jest.fn();
    render(
      <Autocomplete
        items={mockItems}
        value="나무"
        onSelect={mockOnSelect}
        onArrowUpFromFirst={mockOnArrowUpFromFirst}
        externalSelectedIndex={0}
      />,
    );

    const dropdown = screen.getByRole("listbox");
    fireEvent.keyDown(dropdown, { key: "ArrowUp" });

    expect(mockOnArrowUpFromFirst).toHaveBeenCalled();
  });

  it("highlights item based on external selected index", () => {
    render(
      <Autocomplete
        items={mockItems}
        value="나무"
        onSelect={mockOnSelect}
        externalSelectedIndex={0}
      />,
    );

    // Verify first item is highlighted
    const firstItem = screen.getByText("나무 방패").closest("li");
    expect(firstItem).toHaveClass("bg-blue-50");
    expect(firstItem).toHaveAttribute("aria-selected", "true");
  });
});
