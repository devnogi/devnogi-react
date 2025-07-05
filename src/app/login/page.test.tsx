import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Page from "./page";

const pushSpy = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushSpy }),
}));

describe("LoginPage", () => {
  let replaceStateSpy: jest.SpyInstance;

  beforeEach(() => {
    pushSpy.mockClear();

    replaceStateSpy = jest
      .spyOn(window.history, "replaceState")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    replaceStateSpy.mockRestore();
  });

  it("렌더링 테스트", () => {
    render(<Page />);

    expect(screen.getByLabelText("아이디")).toBeInTheDocument();
    expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "로그인", level: 1 }));
    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();

    // 링크 렌더링 테스트
    const homeLink = screen.getByRole("link", { name: /홈으로 돌아가기/ });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");

    const signupLink = screen.getByRole("link", { name: /회원가입/ });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute("href", "/signup");
  });

  // 아이디 validation 테스트
  it("아이디 최소 길이 validation 테스트", async () => {
    render(<Page />);

    const idInput = screen.getByLabelText("아이디");
    fireEvent.change(idInput, { target: { value: "a" } });

    const submitButton = screen.getByRole("button", { name: "로그인" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("아이디는 2자 이상 입력해주세요"),
      ).toBeInTheDocument();
    });
  });

  it("아이디 최대 길이 validation 테스트", async () => {
    render(<Page />);

    const idInput = screen.getByLabelText("아이디");
    fireEvent.change(idInput, { target: { value: "a".repeat(21) } });

    const submitButton = screen.getByRole("button", { name: "로그인" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("아이디는 20자 이하로 입력해주세요"),
      ).toBeInTheDocument();
    });
  });

  it("아이디 특수문자 validation 테스트", async () => {
    render(<Page />);

    const idInput = screen.getByLabelText("아이디");
    fireEvent.change(idInput, { target: { value: "test@123" } });

    const submitButton = screen.getByRole("button", { name: "로그인" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "아이디는 영문, 숫자, 언더스코어(_)만 사용 가능합니다",
        ),
      ).toBeInTheDocument();
    });
  });

  // 비밀번호 validation 테스트
  it("비밀번호 최소 길이 validation 테스트", async () => {
    render(<Page />);

    const passwordInput = screen.getByLabelText("비밀번호");
    fireEvent.change(passwordInput, { target: { value: "12345" } });

    const submitButton = screen.getByRole("button", { name: "로그인" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("비밀번호는 6자 이상 입력해주세요"),
      ).toBeInTheDocument();
    });
  });

  it("비밀번호 최대 길이 validation 테스트", async () => {
    render(<Page />);

    const passwordInput = screen.getByLabelText("비밀번호");
    fireEvent.change(passwordInput, { target: { value: "a".repeat(51) } });

    const submitButton = screen.getByRole("button", { name: "로그인" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("비밀번호는 50자 이하로 입력해주세요"),
      ).toBeInTheDocument();
    });
  });

  it("비밀번호 조합 규칙 validation 테스트", async () => {
    render(<Page />);

    const passwordInput = screen.getByLabelText("비밀번호");
    fireEvent.change(passwordInput, { target: { value: "123456" } });

    const submitButton = screen.getByRole("button", { name: "로그인" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("비밀번호는 영문과 숫자를 포함해야 합니다"),
      ).toBeInTheDocument();
    });
  });

  it("로그인 중... 표시 테스트", async () => {
    render(<Page />);

    const idInput = screen.getByLabelText("아이디");
    const passwordInput = screen.getByLabelText("비밀번호");

    fireEvent.change(idInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const submitButton = screen.getByRole("button", { name: "로그인" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("로그인 중...")).toBeInTheDocument();
    });
  });

  it("로그인 성공 후 홈페이지 이동 테스트", async () => {
    render(<Page />);

    const idInput = screen.getByLabelText("아이디");
    const passwordInput = screen.getByLabelText("비밀번호");

    fireEvent.change(idInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const submitButton = screen.getByRole("button", { name: "로그인" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith("/");
      expect(replaceStateSpy).toHaveBeenCalledWith(null, "", "/");
    });
  });

  it("로그인 성공 후 이전 페이지 이동 테스트", async () => {
    // 이전 페이지 referrer 설정
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "/auction",
      writable: true,
    });

    render(<Page />);

    const idInput = screen.getByLabelText("아이디");
    const passwordInput = screen.getByLabelText("비밀번호");

    fireEvent.change(idInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const submitButton = screen.getByRole("button", { name: "로그인" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith("/auction");
      expect(replaceStateSpy).toHaveBeenCalledWith(null, "", "/auction");
    });
  });
});
