import { render, screen, fireEvent } from "@testing-library/react";
import AuctionCategory from "./Category";

const createMockProps = () => ({
  selectedId: "",
  onSelect: jest.fn(),
  expandedIds: new Set<string>(),
  onToggleExpand: jest.fn(),
});

describe("AuctionCategory", () => {
  it("카테고리 확장 테스트", () => {
    const props = createMockProps();

    render(<AuctionCategory {...props} />);

    // 초기 상태: "전체" 카테고리에 "전체", "+"가 있어야 함
    const expandButton = screen.getByText("+");
    const categoryItem = screen.getByText("전체");
    expect(expandButton).toBeInTheDocument();
    expect(categoryItem).toBeInTheDocument();

    // "+" 클릭 시 확장만 일어남
    fireEvent.click(expandButton);
    expect(props.onSelect).not.toHaveBeenCalled();
    expect(props.onToggleExpand).toHaveBeenCalledWith("all");

    // "전체" 클릭 시 선택과 확장이 동시에 일어남
    fireEvent.click(categoryItem);
    expect(props.onSelect).toHaveBeenCalledWith("all");
    expect(props.onToggleExpand).toHaveBeenCalledWith("all");
  });

  it("카테고리 접기 테스트", () => {
    const props = createMockProps();

    // 확장된 상태로 렌더링
    props.expandedIds = new Set(["all"]);
    props.selectedId = "all";
    render(<AuctionCategory {...props} />);

    // 초기 상태: 자식 카테고리와 "전체", "-"가 있어야 함
    const collapseButton = screen.getByText("-");
    const categoryItem = screen.getByText("전체");

    expect(screen.getByText("근거리 장비")).toBeInTheDocument();
    expect(screen.getByText("원거리 장비")).toBeInTheDocument();
    expect(screen.getByText("마법 장비")).toBeInTheDocument();
    expect(collapseButton).toBeInTheDocument();
    expect(categoryItem).toBeInTheDocument();

    // "-" 클릭 시 접기만 일어남
    fireEvent.click(collapseButton);
    expect(props.onSelect).not.toHaveBeenCalled();
    expect(props.onToggleExpand).toHaveBeenCalledWith("all");

    // "전체" 클릭 시 접기와 선택이 동시에 일어남
    fireEvent.click(categoryItem);
    expect(props.onSelect).toHaveBeenCalledWith("all");
    expect(props.onToggleExpand).toHaveBeenCalledWith("all");
  });

  it("선택된 카테고리 하이라이트 테스트", () => {
    const props = createMockProps();

    // melee - 근거리 장비 선택된 상태로 렌더링
    props.expandedIds = new Set(["all"]);
    props.selectedId = "melee";

    render(<AuctionCategory {...props} />);

    // "근거리 장비"가 화면에 표시되는지 확인
    const selectedItem = screen.getByText("근거리 장비");
    expect(selectedItem).toBeInTheDocument();

    // 선택된 카테고리가 시각적으로 구분되는지 확인
    const parentSpan = selectedItem.parentElement;
    expect(parentSpan).toHaveClass("bg-gray-200", "font-semibold");
  });
});
