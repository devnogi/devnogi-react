import { act, renderHook, waitFor } from "@testing-library/react";
import { useNicknameCandidate } from "./useNicknameCandidate";

const issued = (nickname: string, milliseconds = 60_000) => ({
  nickname,
  nicknameTicket: `ticket-${nickname}`,
  expiresAt: new Date(Date.now() + milliseconds).toISOString(),
});
const success = (data: unknown) => ({ ok: true, json: async () => ({ success: true, data }) }) as Response;

describe("서버 발급 닉네임 후보", () => {
  const originalFetch = global.fetch;
  const fetchMock = jest.fn<Promise<Response>, Parameters<typeof fetch>>();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
  });

  it("화면 진입 시 이름과 티켓을 한 후보로 받고 재발급 시 함께 교체한다", async () => {
    fetchMock.mockResolvedValueOnce(success(issued("첫 번째")))
      .mockResolvedValueOnce(success(issued("두 번째")));
    const { result } = renderHook(() => useNicknameCandidate());
    await waitFor(() => expect(result.current.candidate?.nickname).toBe("첫 번째"));
    expect(result.current.candidate?.nicknameTicket).toBe("ticket-첫 번째");
    await act(async () => { await result.current.refresh(); });
    expect(result.current.candidate).toMatchObject({ nickname: "두 번째", nicknameTicket: "ticket-두 번째" });
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/random-nickname/candidate", { cache: "no-store" });
  });

  it("늦게 온 이전 발급 응답이 최신 후보를 덮지 않는다", async () => {
    let resolveFirst!: (response: Response) => void;
    fetchMock.mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }))
      .mockResolvedValueOnce(success(issued("최신")));
    const { result } = renderHook(() => useNicknameCandidate(false));
    let first!: Promise<void>;
    act(() => { first = result.current.refresh(); });
    await act(async () => { await result.current.refresh(); });
    expect(result.current.candidate?.nickname).toBe("최신");
    await act(async () => { resolveFirst(success(issued("이전"))); await first; });
    expect(result.current.candidate?.nickname).toBe("최신");
  });

  it("실패한 발급과 만료된 후보는 제출에 쓸 수 없도록 제거한다", async () => {
    jest.useFakeTimers();
    fetchMock.mockResolvedValueOnce(success(issued("금방 만료", 1000)))
      .mockResolvedValueOnce({ ok: false, json: async () => ({ success: false }) } as Response);
    const { result } = renderHook(() => useNicknameCandidate(false));
    await act(async () => { await result.current.refresh(); });
    expect(result.current.status).toBe("ready");
    act(() => { jest.advanceTimersByTime(1100); });
    expect(result.current.candidate).toBeNull();
    expect(result.current.status).toBe("expired");
    await act(async () => { await result.current.refresh(); });
    expect(result.current.candidate).toBeNull();
    expect(result.current.status).toBe("error");
    expect(result.current.error).toMatch(/다시 시도/);
  });
});
