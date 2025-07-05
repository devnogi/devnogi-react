import { render, screen } from "@testing-library/react";
import NotFoundPage from "./NotFoundPage";

describe("NotFoundPage", () => {
  it("렌더링 테스트", () => {
    render(<NotFoundPage />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("페이지를 찾을 수 없습니다.")).toBeInTheDocument();

    const homeLink = screen.getByRole("link", { name: "홈으로 돌아가기" });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
