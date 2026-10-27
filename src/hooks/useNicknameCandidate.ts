"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface NicknameCandidate {
  nickname: string;
  nicknameTicket: string;
  expiresAt: string;
}

type CandidateStatus = "idle" | "loading" | "ready" | "error" | "expired";

function isCandidate(value: unknown): value is NicknameCandidate {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<NicknameCandidate>;
  return typeof candidate.nickname === "string" && candidate.nickname.length > 0 &&
    typeof candidate.nicknameTicket === "string" && candidate.nicknameTicket.length > 0 &&
    typeof candidate.expiresAt === "string" && Date.parse(candidate.expiresAt) > Date.now();
}

export function useNicknameCandidate(autoLoad = true) {
  const [candidate, setCandidate] = useState<NicknameCandidate | null>(null);
  const [status, setStatus] = useState<CandidateStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setCandidate(null);
    setStatus("loading");
    setError(null);
    try {
      const response = await fetch("/api/auth/random-nickname/candidate", { cache: "no-store" });
      const body: unknown = await response.json();
      if (!response.ok || !body || typeof body !== "object" ||
          !("success" in body) || body.success !== true ||
          !("data" in body) || !isCandidate(body.data)) {
        throw new Error("닉네임을 발급받지 못했습니다. 다시 시도해주세요.");
      }
      if (currentRequest !== requestId.current) return;
      setCandidate(body.data);
      setStatus("ready");
    } catch {
      if (currentRequest !== requestId.current) return;
      setCandidate(null);
      setStatus("error");
      setError("닉네임을 발급받지 못했습니다. 다시 시도해주세요.");
    }
  }, []);

  useEffect(() => {
    const pendingRequests = requestId;
    if (autoLoad) void refresh();
    return () => { pendingRequests.current++; };
  }, [autoLoad, refresh]);

  useEffect(() => {
    if (!candidate) return;
    const remaining = Date.parse(candidate.expiresAt) - Date.now();
    const timeout = setTimeout(() => {
      setCandidate(null);
      setStatus("expired");
      setError("닉네임 사용 시간이 지났습니다. 다시 뽑아주세요.");
    }, Math.max(0, remaining));
    return () => clearTimeout(timeout);
  }, [candidate]);

  return { candidate, status, error, refresh };
}
