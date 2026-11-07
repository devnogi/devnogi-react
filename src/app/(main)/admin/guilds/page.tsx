"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { guildRequest } from "@/lib/guilds/request";
import { isAdminRole } from "@/utils/roles";

type Registration = {
  id: number;
  applicantId: number;
  guildId: number | null;
  name: string;
  server: string;
  characterName: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reason: string | null;
  createdAt: string;
};

const labels = {
  PENDING: "심사 대기",
  APPROVED: "승인",
  REJECTED: "반려",
  CANCELLED: "신청 취소",
};
const queueKey = ["guild-admin", "registrations"];

function adminRequest<T>(path: string, method = "GET", body?: object) {
  return guildRequest<T>("admin/guilds/" + path, method, body);
}

function ReviewCard({ entry }: { entry: Registration }) {
  const cache = useQueryClient();
  const [reason, setReason] = useState("");
  const [userId, setUserId] = useState("");
  const action = useMutation({
    mutationFn: ({
      path,
      method,
      body,
    }: {
      path: string;
      method: string;
      body: object;
    }) => adminRequest(path, method, body),
    onSuccess: () => cache.invalidateQueries({ queryKey: queueKey }),
  });
  function review(decision: "APPROVED" | "REJECTED") {
    action.mutate({
      path: `registrations/${entry.id}/review`,
      method: "POST",
      body: { decision, reason: reason.trim() },
    });
  }
  function assign(event: FormEvent) {
    event.preventDefault();
    if (
      !entry.guildId ||
      !/^[1-9]\d*$/.test(userId) ||
      !Number.isSafeInteger(Number(userId))
    )
      return;
    action.mutate({
      path: `${entry.guildId}/master`,
      method: "PUT",
      body: { userId: Number(userId) },
    });
  }
  return (
    <article className="space-y-3 rounded-xl border p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">
          {entry.guildId ? (
            <Link href={`/guilds/${entry.guildId}`}>{entry.name}</Link>
          ) : (
            entry.name
          )}
        </h2>
        <span>{labels[entry.status]}</span>
      </header>
      <p>
        {entry.server} · {entry.characterName} · 신청자 ID {entry.applicantId}
      </p>
      <time dateTime={entry.createdAt}>{entry.createdAt.slice(0, 10)}</time>
      <p className="whitespace-pre-wrap">{entry.description}</p>
      {entry.reason && <p>처리 사유 · {entry.reason}</p>}
      {entry.status === "PENDING" && (
        <div className="space-y-2">
          <label className="block">
            심사 사유 (반려 시 필수)
            <textarea
              className="mt-1 block w-full rounded border bg-transparent p-2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <Button
              disabled={action.isPending}
              onClick={() => review("APPROVED")}
            >
              승인
            </Button>
            <Button
              variant="outline"
              disabled={action.isPending || !reason.trim()}
              onClick={() => review("REJECTED")}
            >
              반려
            </Button>
          </div>
        </div>
      )}
      {entry.status === "APPROVED" && entry.guildId && (
        <form className="flex flex-wrap items-end gap-2" onSubmit={assign}>
          <label>
            새 마스터의 사용자 ID
            <input
              required
              inputMode="numeric"
              pattern="[1-9][0-9]*"
              className="block rounded border bg-transparent p-2"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </label>
          <Button type="submit" disabled={action.isPending}>
            마스터 지정·교체
          </Button>
        </form>
      )}
      {action.isError && <p role="alert">{action.error.message}</p>}
      {action.isSuccess && <p role="status">처리했습니다.</p>}
    </article>
  );
}

export default function GuildAdministration() {
  const { user, isLoading } = useAuth();
  const admin = isAdminRole(user?.role);
  const [history, setHistory] = useState(false);
  const queue = useQuery<Registration[]>({
    queryKey: [...queueKey, user?.userId],
    queryFn: () => adminRequest<Registration[]>("registrations"),
    enabled: admin,
  });
  if (isLoading) return <p role="status">권한 확인 중…</p>;
  if (!admin) return <p role="alert">관리자 계정으로 로그인해야 합니다.</p>;
  const rows = queue.data?.filter(
    (row) => history !== (row.status === "PENDING"),
  );
  return (
    <main className="mx-auto max-w-3xl space-y-5 p-5">
      <Link href="/admin">운영자 작업 콘솔</Link>
      <h1 className="text-2xl font-bold">길드 등록 관리</h1>
      <div className="flex gap-2">
        <Button
          variant={history ? "outline" : "default"}
          onClick={() => setHistory(false)}
        >
          심사 대기
        </Button>
        <Button
          variant={history ? "default" : "outline"}
          onClick={() => setHistory(true)}
        >
          처리 이력 및 마스터 지정
        </Button>
      </div>
      {queue.isPending && <p role="status">신청 불러오는 중…</p>}
      {queue.isError && <p role="alert">{queue.error.message}</p>}
      {rows?.length === 0 && <p>표시할 신청이 없습니다.</p>}
      {rows?.map((entry) => <ReviewCard key={entry.id} entry={entry} />)}
    </main>
  );
}
