import { fireEvent, render, screen } from "@testing-library/react";

import DataFetchError from "./DataFetchError";

it("재시도를 실행하고 진행 중에는 중복 클릭을 차단한다", () => {
  const onRetry = jest.fn();
  const { rerender } = render(<DataFetchError onRetry={onRetry} compact />);
  fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
  expect(onRetry).toHaveBeenCalledTimes(1);
  rerender(<DataFetchError onRetry={onRetry} compact isRetrying />);
  const button = screen.getByRole("button", { name: "다시 조회 중..." });
  expect(button).toBeDisabled();
  fireEvent.click(button);
  expect(onRetry).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("status")).toHaveTextContent(
    "데이터를 받아오지 못 하였습니다",
  );
});

it("기존 showRetry=false 호출은 버튼을 표시하지 않는다", () => {
  render(<DataFetchError onRetry={jest.fn()} showRetry={false} />);
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});
