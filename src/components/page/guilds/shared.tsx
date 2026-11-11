"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, type ReactNode, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { guildRequest as api } from "@/lib/guilds/request";
import type { ActivityGrade } from "@/types/experience";

export { api };
export function useGuildData<T>(path: string, enabled = true) {
  const { user, isLoading } = useAuth();
  return useQuery({
    queryKey: ["guild", user?.userId ?? "guest", path],
    queryFn: () => api<T>(path, "GET", undefined, !user),
    enabled: enabled && !isLoading,
    retry: false,
  });
}
export function Action({
  run,
  children,
  label,
  disabled = false,
}: {
  run: (form: FormData) => Promise<unknown>;
  children?: ReactNode;
  label: string;
  disabled?: boolean;
}) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await run(new FormData(e.currentTarget));
      await qc.invalidateQueries({ queryKey: ["guild"] });
      setMessage("완료되었습니다.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "처리에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="grid gap-3">
      {children}
      <button
        disabled={disabled || busy}
        className="justify-self-start rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-50"
      >
        {busy ? "처리 중…" : label}
      </button>
      <span role="status">{message}</span>
    </form>
  );
}
export function Field({
  name,
  label,
  value = "",
  long = false,
  required = false,
  type = "text",
}: {
  name: string;
  label: string;
  value?: string;
  long?: boolean;
  required?: boolean;
  type?: string;
}) {
  return (
    <label>
      {label}
      {long ? (
        <textarea name={name} defaultValue={value} required={required} />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={value}
          required={required}
        />
      )}
    </label>
  );
}
export function Notice({
  pending,
  error,
}: {
  pending: boolean;
  error: Error | null;
}) {
  return error ? (
    <p role="alert">{error.message}</p>
  ) : pending ? (
    <p>불러오는 중…</p>
  ) : null;
}
export const statusNames: Record<string, string> = {
  PENDING: "심사 중",
  APPROVED: "승인",
  REJECTED: "거절",
  ACCEPTED: "수락",
  CANCELLED: "취소",
  OPEN: "모집 중",
  CLOSED: "마감",
  MASTER: "마스터",
  DEPUTY: "부마스터",
  MEMBER: "길드원",
};
export interface Registration {
  id: number;
  name: string;
  description: string;
  server: string;
  characterName: string;
  applicantId: number;
  status: string;
  guildId: number | null;
  createdAt: string;
  reason?: string;
}
export interface Application {
  id: number;
  guildId: number;
  guildName?: string;
  recruitmentId: number;
  characterName: string;
  status: string;
  message?: string;
}
export interface Entry {
  id: number;
  authorId: number;
  authorNickname?: string;
  authorVerified?: boolean;
  activityGrade?: ActivityGrade | null;
  title: string;
  body: string;
  visibility?: string;
  status?: string;
  requirements?: string;
  hasPhoto?: boolean;
}
export interface Guild {
  id: number;
  name: string;
  server: string;
  tagline: string;
  hasEmblem: boolean;
  hasBanner: boolean;
  recruiting: boolean;
  description: string;
  theme: string;
  tags: string;
  activityTime: string;
  viewerRole: string | null;
  canEdit: boolean;
  masterId: number | null;
  posts: Entry[];
  recruitments: Entry[];
}
export function upload(path: string, file: File) {
  const data = new FormData();
  data.set("file", file);
  return api(path, "PUT", data);
}
