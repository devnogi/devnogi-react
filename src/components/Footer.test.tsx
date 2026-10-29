import { render, screen } from "@testing-library/react";

import Footer from "./Footer";

describe("Footer", () => {
  it("렌더링 테스트 - 사이트명과 문구가 표시된다", () => {
    render(<Footer />);

    expect(screen.getAllByText("MEMONOGI").length).toBeGreaterThan(0);
    expect(screen.getAllByText("공식 사이트 아님").length).toBeGreaterThan(0);
  });

  it("렌더링 테스트 - 데이터 출처가 표시된다", () => {
    render(<Footer />);

    expect(
      screen.getAllByText("Data provided by NEXON Open API").length,
    ).toBeGreaterThan(0);
  });

  it.each([
    ["이용약관", "/terms"],
    ["개인정보처리방침", "/privacy"],
    ["문의", "/contact"],
  ])("%s 링크가 실제 공개 URL을 가리킨다", (label, href) => {
    render(<Footer />);

    for (const link of screen.getAllByRole("link", { name: label })) {
      expect(link).toHaveAttribute("href", href);
    }
  });
});
