import { render, screen, fireEvent } from "@testing-library/react";
import Footer from "./Footer";
import { toast } from "sonner";

jest.mock("sonner", () => ({
  toast: jest.fn(),
}));

describe("Footer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("렌더링 테스트 - 사이트명과 문구가 표시된다", () => {
    render(<Footer />);

    expect(screen.getAllByText("MEMONOGI").length).toBeGreaterThan(0);
    expect(screen.getAllByText("공식 사이트 아님").length).toBeGreaterThan(0);
  });

  it("렌더링 테스트 - 데이터 출처가 표시된다", () => {
    render(<Footer />);

    expect(
      screen.getAllByText("Data provided by NEXON Open API").length
    ).toBeGreaterThan(0);
  });

  it("렌더링 테스트 - 이용약관 링크가 표시된다", () => {
    render(<Footer />);

    const links = screen.getAllByRole("link", { name: "이용약관" });
    expect(links.length).toBeGreaterThan(0);
  });

  it("렌더링 테스트 - 개인정보처리방침 링크가 표시된다", () => {
    render(<Footer />);

    const links = screen.getAllByRole("link", { name: "개인정보처리방침" });
    expect(links.length).toBeGreaterThan(0);
  });

  it("렌더링 테스트 - 문의 링크가 표시된다", () => {
    render(<Footer />);

    const links = screen.getAllByRole("link", { name: "문의" });
    expect(links.length).toBeGreaterThan(0);
  });

  it("이용약관 링크 클릭 시 알림이 표시된다", () => {
    render(<Footer />);

    const links = screen.getAllByRole("link", { name: "이용약관" });
    fireEvent.click(links[0]);

    expect(toast).toHaveBeenCalledWith(
      "죄송합니다. 해당 메뉴는 오픈 준비 중입니다",
      { description: "빠른 시일 내에 준비하겠습니다!" }
    );
  });

  it("개인정보처리방침 링크 클릭 시 알림이 표시된다", () => {
    render(<Footer />);

    const links = screen.getAllByRole("link", { name: "개인정보처리방침" });
    fireEvent.click(links[0]);

    expect(toast).toHaveBeenCalledWith(
      "죄송합니다. 해당 메뉴는 오픈 준비 중입니다",
      { description: "빠른 시일 내에 준비하겠습니다!" }
    );
  });

  it("문의 링크 클릭 시 알림이 표시된다", () => {
    render(<Footer />);

    const links = screen.getAllByRole("link", { name: "문의" });
    fireEvent.click(links[0]);

    expect(toast).toHaveBeenCalledWith(
      "죄송합니다. 해당 메뉴는 오픈 준비 중입니다",
      { description: "빠른 시일 내에 준비하겠습니다!" }
    );
  });
});
