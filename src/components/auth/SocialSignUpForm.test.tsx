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

it("후보가 없으면 소셜 가입을 비활성화한다", async () => {
  jest.mocked(useNicknameCandidate).mockReturnValue({
    candidate: null, status: "error", error: "다시 시도해주세요", refresh: jest.fn(),
  });
  render(<SocialSignUpForm provider="google" providerUserId="synthetic-user"
    onSuccess={jest.fn()} onError={jest.fn()} onCancel={jest.fn()} />);
  await waitFor(() => expect(screen.getByRole("button", { name: "회원가입" })).toBeDisabled());
  expect(screen.getByRole("status")).toHaveTextContent("다시 시도해주세요");
});

it("만료된 티켓 거절 뒤에는 다시 뽑기 전 재제출을 막는다", async () => {
  jest.mocked(clientAxios.post).mockRejectedValue({
    response: { status: 400, data: { code: "EXPIRED_NICKNAME_TICKET" } },
  });
  const onError = jest.fn();
  render(<SocialSignUpForm provider="google" providerUserId="synthetic-user"
    onSuccess={jest.fn()} onError={onError} onCancel={jest.fn()} />);
  await waitFor(() => expect(screen.getByRole("button", { name: "회원가입" })).toBeEnabled());
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "회원가입" })); });
  await waitFor(() => expect(onError).toHaveBeenCalledWith(expect.stringContaining("다시 뽑아주세요")));
  expect(screen.getByRole("button", { name: "회원가입" })).toBeDisabled();
});
