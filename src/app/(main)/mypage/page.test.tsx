import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { useNicknameCandidate } from "@/hooks/useNicknameCandidate";
import { useUnreadNoticeCount } from "@/hooks/useNotices";
import { useVerificationInfo } from "@/hooks/useUserVerification";
import { clientAxios } from "@/lib/api/clients";

import MyPage from "./page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams("tab=profile"),
}));
jest.mock("@/contexts/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("@/hooks/useNicknameCandidate", () => ({
  useNicknameCandidate: jest.fn(),
}));
jest.mock("@/hooks/useUserVerification", () => ({
  useVerificationInfo: jest.fn(),
}));
jest.mock("@/hooks/useNotices", () => ({ useUnreadNoticeCount: jest.fn() }));
jest.mock("@/lib/api/clients", () => ({ clientAxios: { put: jest.fn() } }));
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));
jest.mock("@/components/auth/LoginModal", () => () => null);
jest.mock("@/components/page/mypage/NotificationList", () => () => null);
jest.mock("@/components/page/mypage/VerificationTab", () => () => null);
jest.mock("@/components/page/community/PostList", () => () => null);

const legacyNickname = "기존이름";
const candidate = {
  nickname: "행복한 나무 A1B2C",
  nicknameTicket: "synthetic-candidate-ticket",
  expiresAt: "2099-01-01T00:00:00Z",
};

function openEditor() {
  render(<MyPage />);
  fireEvent.click(screen.getByRole("button", { name: "프로필 수정" }));
  return screen.getByRole("textbox", { name: "닉네임" });
}

describe("마이페이지 닉네임 변경 경계", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      user: {
        userId: 7,
        email: "user@example.test",
        nickname: legacyNickname,
        profileImageUrl: null,
        verified: false,
        role: "USER",
      },
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn(),
      refreshUser: jest.fn().mockResolvedValue(undefined),
    } as unknown as ReturnType<typeof useAuth>);
    jest
      .mocked(useVerificationInfo)
      .mockReturnValue({ data: { verified: false } } as ReturnType<
        typeof useVerificationInfo
      >);
    jest.mocked(useUnreadNoticeCount).mockReturnValue(0);
    jest.mocked(useNicknameCandidate).mockReturnValue({
      candidate: null,
      status: "idle",
      error: null,
      refresh: jest.fn(),
    });
    jest.mocked(clientAxios.put).mockResolvedValue({ data: { success: true } });
  });

  it("기존 이름을 그대로 두고 이미지만 수정하면 티켓 없이 전송한다", async () => {
    const nicknameInput = openEditor();
    expect(nicknameInput).toHaveValue(legacyNickname);
    expect(nicknameInput).toHaveAttribute("readonly");
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["synthetic-image"], "avatar.png", {
      type: "image/png",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() =>
      expect(screen.getByAltText("Profile Preview")).toBeInTheDocument(),
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "저장" }));
    });
    await waitFor(() => expect(clientAxios.put).toHaveBeenCalledTimes(1));
    const form = jest.mocked(clientAxios.put).mock.calls[0][1] as FormData;
    expect(form.get("nickname")).toBe(legacyNickname);
    expect(form.get("nicknameTicket")).toBeNull();
  });

  it("이름 변경에는 발급 후보와 해당 티켓을 함께 전송한다", async () => {
    jest.mocked(useNicknameCandidate).mockReturnValue({
      candidate,
      status: "ready",
      error: null,
      refresh: jest.fn(),
    });
    expect(openEditor()).toHaveValue(candidate.nickname);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "저장" }));
    });
    await waitFor(() => expect(clientAxios.put).toHaveBeenCalledTimes(1));
    const form = jest.mocked(clientAxios.put).mock.calls[0][1] as FormData;
    expect(form.get("nickname")).toBe(candidate.nickname);
    expect(form.get("nicknameTicket")).toBe(candidate.nicknameTicket);
  });

  it("만료된 후보는 저장하지 않는다", async () => {
    jest.mocked(useNicknameCandidate).mockReturnValue({
      candidate: { ...candidate, expiresAt: "2000-01-01T00:00:00Z" },
      status: "ready",
      error: null,
      refresh: jest.fn(),
    });
    openEditor();
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(clientAxios.put).not.toHaveBeenCalled();
    expect(toast.warning).toHaveBeenCalledWith(
      expect.stringContaining("다시 발급"),
    );
  });

  it("중복 409 뒤에는 다시 뽑기 전 재제출을 차단한다", async () => {
    jest.mocked(useNicknameCandidate).mockReturnValue({
      candidate,
      status: "ready",
      error: null,
      refresh: jest.fn(),
    });
    jest.mocked(clientAxios.put).mockRejectedValue({
      response: { status: 409, data: { code: "NICKNAME_ALREADY_EXISTS" } },
    });
    openEditor();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "저장" }));
    });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "저장" })).toBeDisabled(),
    );
    expect(clientAxios.put).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("다시 뽑아주세요");
  });

  it("서버가 만료 400을 반환해도 다시 뽑기 전 재제출을 차단한다", async () => {
    jest.mocked(useNicknameCandidate).mockReturnValue({
      candidate,
      status: "ready",
      error: null,
      refresh: jest.fn(),
    });
    jest.mocked(clientAxios.put).mockRejectedValue({
      response: {
        status: 400,
        data: { code: "EXPIRED_NICKNAME_TICKET" },
      },
    });
    openEditor();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "저장" }));
    });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "저장" })).toBeDisabled(),
    );
    expect(clientAxios.put).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent(
      "사용 시간이 지났거나 유효하지 않습니다",
    );
  });
});
