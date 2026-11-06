import { render, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import {
  useIssueVerificationToken,
  useReissueVerificationToken,
  useVerificationToken,
} from "@/hooks/useUserVerification";

import VerificationTokenCard from "./VerificationTokenCard";

jest.mock("@/contexts/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("@/hooks/useUserVerification", () => ({
  useVerificationToken: jest.fn(),
  useIssueVerificationToken: jest.fn(),
  useReissueVerificationToken: jest.fn(),
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const token = {
  tokenId: 17,
  verificationCode: "VERIFY-17",
  tokenStatus: "VERIFIED" as const,
  issuedAt: "2026-11-07T00:00:00Z",
  expiresAt: "2026-11-07T01:00:00Z",
  expiresInSeconds: 0,
  revoked: false,
  verified: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
  jest.mocked(useVerificationToken).mockReturnValue({
    data: token,
    isLoading: false,
    refetch: jest.fn(),
  } as unknown as ReturnType<typeof useVerificationToken>);
  jest.mocked(useIssueVerificationToken).mockReturnValue({
    isPending: false,
    mutateAsync: jest.fn(),
  } as unknown as ReturnType<typeof useIssueVerificationToken>);
  jest.mocked(useReissueVerificationToken).mockReturnValue({
    isPending: false,
    mutateAsync: jest.fn(),
  } as unknown as ReturnType<typeof useReissueVerificationToken>);
});

it("같은 인증 토큰은 탭 재진입으로 다시 마운트되어도 알림을 반복하지 않는다", async () => {
  const refreshUser = jest.fn().mockResolvedValue(undefined);
  jest.mocked(useAuth).mockReturnValue({
    refreshUser,
  } as unknown as ReturnType<typeof useAuth>);
  const firstRender = render(<VerificationTokenCard />);
  await waitFor(() => expect(refreshUser).toHaveBeenCalledTimes(1));
  firstRender.unmount();

  render(<VerificationTokenCard />);

  expect(refreshUser).toHaveBeenCalledTimes(1);
  expect(toast.success).toHaveBeenCalledTimes(1);
});

it("같은 인증 토큰 성공은 Auth 콜백이 바뀌어도 한 번만 알린다", async () => {
  const firstRefresh = jest.fn().mockResolvedValue(undefined);
  jest.mocked(useAuth).mockReturnValue({
    refreshUser: firstRefresh,
  } as unknown as ReturnType<typeof useAuth>);
  const { rerender } = render(<VerificationTokenCard />);

  await waitFor(() => expect(firstRefresh).toHaveBeenCalledTimes(1));
  expect(toast.success).toHaveBeenCalledWith("캐릭터 인증이 완료되었습니다!");

  const nextRefresh = jest.fn().mockResolvedValue(undefined);
  jest.mocked(useAuth).mockReturnValue({
    refreshUser: nextRefresh,
  } as unknown as ReturnType<typeof useAuth>);
  rerender(<VerificationTokenCard />);

  expect(nextRefresh).not.toHaveBeenCalled();
  expect(toast.success).toHaveBeenCalledTimes(1);
  expect(screen.getByText("인증이 완료되었습니다!")).toBeInTheDocument();
});

it("새 토큰의 인증 성공은 새 알림으로 처리한다", async () => {
  const refreshUser = jest.fn().mockResolvedValue(undefined);
  jest.mocked(useAuth).mockReturnValue({
    refreshUser,
  } as unknown as ReturnType<typeof useAuth>);
  const { rerender } = render(<VerificationTokenCard />);
  await waitFor(() => expect(refreshUser).toHaveBeenCalledTimes(1));

  jest.mocked(useVerificationToken).mockReturnValue({
    data: { ...token, tokenId: 18 },
    isLoading: false,
    refetch: jest.fn(),
  } as unknown as ReturnType<typeof useVerificationToken>);
  rerender(<VerificationTokenCard />);

  await waitFor(() => expect(refreshUser).toHaveBeenCalledTimes(2));
  expect(toast.success).toHaveBeenCalledTimes(2);
});
