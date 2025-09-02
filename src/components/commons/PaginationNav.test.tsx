import { render, screen, fireEvent } from "@testing-library/react";
import PaginationNav from "./PaginationNav";

const createMockProps = () => ({
  currentPage: 5,
  totalPages: 20,
  onPageChange: jest.fn(),
});

describe("PaginationNav", () => {
  it("기본 렌더링 테스트", () => {
    const props = createMockProps();
    render(<PaginationNav {...props} />);

    // 현재 페이지가 활성화되어 있는지 확인
    expect(screen.getByText("5")).toHaveAttribute("data-active", "true");
    
    // 11개의 페이지 번호가 표시되는지 확인
    for (let i = 1; i <= 11; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });

  it("페이지 번호 클릭 동작 테스트", () => {
    const props = createMockProps();
    render(<PaginationNav {...props} />);

    // 다른 페이지 클릭
    fireEvent.click(screen.getByText("7"));
    expect(props.onPageChange).toHaveBeenCalledWith(7);

    // 현재 페이지 클릭
    fireEvent.click(screen.getByText("5"));
    expect(props.onPageChange).toHaveBeenCalledWith(5);
  });

  it("이전/다음 버튼 동작 테스트", () => {
    const props = createMockProps();
    render(<PaginationNav {...props} />);

    // 이전 버튼 클릭
    const previousButton = screen.getByLabelText("Go to previous page");
    fireEvent.click(previousButton);
    expect(props.onPageChange).toHaveBeenCalledWith(4);

    // 다음 버튼 클릭
    const nextButton = screen.getByLabelText("Go to next page");
    fireEvent.click(nextButton);
    expect(props.onPageChange).toHaveBeenCalledWith(6);
  });

  it("Step 버튼 동작 테스트", () => {
    const props = createMockProps();
    props.currentPage = 10;
    render(<PaginationNav {...props} />);

    // PreviousStep 버튼 클릭 (첫 번째 previous 버튼)
    const previousStepButton = screen.getAllByLabelText("Go to previous page")[0];
    fireEvent.click(previousStepButton);
    expect(props.onPageChange).toHaveBeenCalledWith(5); // 10-5=5

    // NextStep 버튼 클릭 (두 번째 next 버튼)
    const nextStepButton = screen.getAllByLabelText("Go to next page")[1];
    fireEvent.click(nextStepButton);
    expect(props.onPageChange).toHaveBeenCalledWith(15); // 10+5=15
  });

  it("1페이지에서 이전 버튼 비활성화 테스트", () => {
    const props = createMockProps();
    props.currentPage = 1;
    render(<PaginationNav {...props} />);

    const previousButtons = screen.getAllByLabelText("Go to previous page");
    previousButtons.forEach(button => {
      expect(button).toHaveClass("opacity-50");
      expect(button).toHaveClass("pointer-events-none");
    });
  });

  it("마지막 페이지에서 다음 버튼 비활성화 테스트", () => {
    const props = createMockProps();
    props.currentPage = 20;
    props.totalPages = 20;
    render(<PaginationNav {...props} />);

    const nextButtons = screen.getAllByLabelText("Go to next page");
    nextButtons.forEach(button => {
      expect(button).toHaveClass("opacity-50");
      expect(button).toHaveClass("pointer-events-none");
    });
  });

  it("총 페이지가 11개 미만일 때 모든 페이지 표시 테스트", () => {
    const props = createMockProps();
    props.totalPages = 8;
    render(<PaginationNav {...props} />);

    // 1부터 8까지 모든 페이지가 표시되는지 확인
    for (let i = 1; i <= 8; i++) {
      expect(screen.getByText(i.toString())).toBeInTheDocument();
    }
  });

  it("페이지 범위 계산 테스트", () => {
    const props = createMockProps();
    props.currentPage = 10;
    render(<PaginationNav {...props} />);

    // 5부터 15까지 표시되어야 함
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.queryByText("4")).not.toBeInTheDocument();
    expect(screen.queryByText("16")).not.toBeInTheDocument();
  });

  it("접근성 테스트", () => {
    const props = createMockProps();
    render(<PaginationNav {...props} />);

    // ARIA 라벨 확인
    expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "pagination");
    
    // 현재 페이지에 aria-current 속성 확인
    const currentPageLink = screen.getByText("5");
    expect(currentPageLink).toHaveAttribute("aria-current", "page");
  });
}); 