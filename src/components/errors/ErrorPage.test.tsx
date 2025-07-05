import { render, screen, fireEvent } from "@testing-library/react";
import ErrorPage from "./ErrorPage";

describe("ErrorPage", () => {
  const mockReset = jest.fn();
  const mockError = new Error("Test Error");

  beforeEach(() => {
    mockReset.mockClear();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("렌더링 테스트", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);

    expect(
      screen.getByRole("heading", { name: "문제가 발생했습니다!" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "다시 시도" }),
    ).toBeInTheDocument();
  });

  it("reset 버튼 동작 테스트", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);

    const retryButton = screen.getByRole("button", { name: "다시 시도" });
    fireEvent.click(retryButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});
