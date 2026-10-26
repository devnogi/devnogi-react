import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import SocialSignUpForm from "./SocialSignUpForm";
import { clientAxios } from "@/lib/api/clients";
import { useNicknameCandidate } from "@/hooks/useNicknameCandidate";

jest.mock("@/lib/api/clients", () => ({ clientAxios: { post: jest.fn() } }));
jest.mock("@/hooks/useNicknameCandidate", () => ({ useNicknameCandidate: jest.fn() }));

const candidate = {
  nickname: "행복한 나무 A1B2C",
  nicknameTicket: "synthetic-candidate-ticket",
  expiresAt: "2099-01-01T00:00:00Z",
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useNicknameCandidate).mockReturnValue({
    candidate, status: "ready", error: null, refresh: jest.fn(),
  });
});

it("소셜 가입에서 수동 입력을 막고 발급 후보와 티켓을 함께 보낸다", async () => {
  jest.mocked(clientAxios.post).mockResolvedValue({ data: { success: true, data: { id: 42 } } });
  const onSuccess = jest.fn();
  render(<SocialSignUpForm provider="google" providerUserId="synthetic-user"
    email="user@example.test" onSuccess={onSuccess} onError={jest.fn()} onCancel={jest.fn()} />);

  const input = screen.getByRole("textbox", { name: /닉네임/ });
  expect(input).toHaveValue(candidate.nickname);
  expect(input).toHaveAttribute("readonly");
  await waitFor(() => expect(screen.getByRole("button", { name: "회원가입" })).toBeEnabled());
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "회원가입" })); });

  await waitFor(() => expect(clientAxios.post).toHaveBeenCalledTimes(1));
  const [, formData] = jest.mocked(clientAxios.post).mock.calls[0];
  expect(formData).toBeInstanceOf(FormData);
  expect((formData as FormData).get("nickname")).toBe(candidate.nickname);
  expect((formData as FormData).get("nicknameTicket")).toBe(candidate.nicknameTicket);
  await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(42));
});

it("새 OAuth 교환 뒤에는 서버 발급 가입 증명만 보내고 클라이언트 신원 필드를 보내지 않는다", async () => {
  jest.mocked(clientAxios.post).mockResolvedValue({ data: { success: true, data: { id: 42 } } });
  render(<SocialSignUpForm provider="google" signupProof="synthetic-proof" email="user@example.test"
    onSuccess={jest.fn()} onError={jest.fn()} onCancel={jest.fn()} />);

  await waitFor(() => expect(screen.getByRole("button", { name: "회원가입" })).toBeEnabled());
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "회원가입" })); });
  await waitFor(() => expect(clientAxios.post).toHaveBeenCalledTimes(1));
  const [, formData] = jest.mocked(clientAxios.post).mock.calls[0];
  expect((formData as FormData).get("signupProof")).toBe("synthetic-proof");
  expect((formData as FormData).get("provider")).toBeNull();
  expect((formData as FormData).get("providerUserId")).toBeNull();
  expect((formData as FormData).get("email")).toBeNull();
});

it("후보가 없으면 소셜 가입을 비활성화한다", async () => {
  jest.mocked(useNicknameCandidate).mockReturnValue({
    candidate: null, status: "error", error: "다시 시도해주세요", refresh: jest.fn(),
  });
  render(<SocialSignUpForm provider="google" providerUserId="synthetic-user"
    onSuccess={jest.fn()} onError={jest.fn()} onCancel={jest.fn()} />);
  await waitFor(() => expect(screen.getByRole("button", { name: "회원가입" })).toBeDisabled());
  expect(screen.getByRole("status")).toHaveTextContent("다시 시도해주세요");
});

it.each([
  [400, "EXPIRED_NICKNAME_TICKET"],
  [400, "INVALID_NICKNAME_TICKET"],
  [409, "NICKNAME_ALREADY_EXISTS"],
])("닉네임 오류 %s/%s 뒤 폼에서 새 후보로 재시도한다", async (status, code) => {
  const nextCandidate = { ...candidate, nickname: "행복한 나무 D4E5F", nicknameTicket: "next-ticket" };
  const refresh = jest.fn(async () => {
    jest.mocked(useNicknameCandidate).mockReturnValue({
      candidate: nextCandidate, status: "ready", error: null, refresh,
    });
  });
  jest.mocked(useNicknameCandidate).mockReturnValue({ candidate, status: "ready", error: null, refresh });
  jest.mocked(clientAxios.post)
    .mockRejectedValueOnce({ response: { status, data: { code } } })
    .mockResolvedValueOnce({ data: { success: true, data: { id: 42 } } });
  const onError = jest.fn();
  const onSuccess = jest.fn();
  const props = { provider: "google" as const, providerUserId: "synthetic-user", onSuccess, onError, onCancel: jest.fn() };
  const { rerender } = render(<SocialSignUpForm {...props} />);
  await waitFor(() => expect(screen.getByRole("button", { name: "회원가입" })).toBeEnabled());
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "회원가입" })); });
  await waitFor(() => expect(screen.getByRole("button", { name: "회원가입" })).toBeDisabled());
  expect(screen.getByRole("status")).toHaveTextContent("다시 뽑아주세요");
  expect(onError).not.toHaveBeenCalled();
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "다시 뽑기" })); });
  rerender(<SocialSignUpForm {...props} />);
  await waitFor(() => expect(screen.getByRole("button", { name: "회원가입" })).toBeEnabled());
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "회원가입" })); });
  await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(42));
  expect((jest.mocked(clientAxios.post).mock.calls[1][1] as FormData).get("nicknameTicket")).toBe("next-ticket");
});

it("이메일 중복 409는 닉네임 재발급을 요구하지 않는다", async () => {
  jest.mocked(clientAxios.post).mockRejectedValue({ response: { status: 409, data: { code: "EMAIL_ALREADY_EXISTS" } } });
  const onError = jest.fn();
  render(<SocialSignUpForm provider="google" signupProof="synthetic-proof"
    onSuccess={jest.fn()} onError={onError} onCancel={jest.fn()} />);
  await waitFor(() => expect(screen.getByRole("button", { name: "회원가입" })).toBeEnabled());
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "회원가입" })); });
  expect(await screen.findByRole("alert")).toHaveTextContent("이미 가입된 이메일");
  expect(screen.getByRole("status")).not.toHaveTextContent("다시 뽑아주세요");
  expect(onError).not.toHaveBeenCalled();
});

it("소셜 가입의 기타 4xx도 서버 메시지와 최신 화면 갱신 방법을 보여준다", async () => {
  jest.mocked(clientAxios.post).mockRejectedValue({
    response: { status: 422, data: { code: "OLD_FORM", message: "가입 양식을 갱신해주세요." } },
  });
  const onError = jest.fn();
  render(<SocialSignUpForm provider="google" providerUserId="synthetic-user"
    onSuccess={jest.fn()} onError={onError} onCancel={jest.fn()} />);
  await waitFor(() => expect(screen.getByRole("button", { name: "회원가입" })).toBeEnabled());
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "회원가입" })); });
  await waitFor(() => expect(onError).toHaveBeenCalledWith(
    expect.stringContaining("회원가입 요청을 처리하지 못했습니다.")));
  expect(onError).toHaveBeenCalledWith(expect.stringContaining("페이지를 새로고침"));
});
