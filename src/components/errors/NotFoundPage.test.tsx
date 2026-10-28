import { fireEvent, render, screen } from "@testing-library/react";

import NotFoundPage from "./NotFoundPage";

const backMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter() {
    return { back: backMock };
  },
}));

describe("NotFoundPage", () => {
  beforeEach(() => {
    backMock.mockClear();
  });

  it("렌더링 테스트", () => {
    render(<NotFoundPage />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("페이지를 찾을 수 없습니다.")).toBeInTheDocument();

    const homeLink = screen.getByRole("link", { name: "홈으로 가기" });
    const histBackLink = screen.getByRole("button", { name: "뒤로 가기" });

    fireEvent.click(histBackLink);

    expect(homeLink).toBeInTheDocument();
    expect(histBackLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
    expect(backMock).toHaveBeenCalledTimes(1);
  });
});
