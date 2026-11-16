import { fireEvent, render, screen } from "@testing-library/react";

import QueryRefreshControls from "./QueryRefreshControls";

it("labels successful retrieval time in Korean time and disables concurrent refresh", () => {
  const refresh = jest.fn();
  const props = {
    updatedAt: Date.parse("2026-11-14T01:02:03Z"),
    onRefresh: refresh,
  };
  const { rerender } = render(
    <QueryRefreshControls {...props} isFetching={false} />,
  );
  expect(screen.getByText("마지막 조회 10:02:03")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "새로고침" }));
  expect(refresh).toHaveBeenCalledTimes(1);
  rerender(<QueryRefreshControls {...props} isFetching />);
  const button = screen.getByRole("button", { name: "새로고침" });
  expect(button).toBeDisabled();
  fireEvent.click(button);
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(screen.getByText(/마지막 조회 10:02:03/)).toHaveTextContent(
    "조회 중...",
  );
});
