"use client";
import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import type { UserVerificationInfoResponse } from "@/types/verification";

import {
  Action,
  api,
  type Application,
  Field,
  type Guild,
  Notice,
  type Registration,
  statusNames,
  useGuildData,
} from "./shared";

export default function Directory() {
  const { user } = useAuth();
  const verification = useGuildData<UserVerificationInfoResponse>(
    "user/verification/info",
    !!user,
  );
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const list = useGuildData<Guild[]>("guilds?page=" + page + "&" + search);
  const registrations = useGuildData<Registration[]>(
    "guilds/registrations",
    !!user,
  );
  const applications = useGuildData<Application[]>(
    "guilds/my/applications",
    !!user,
  );
  return (
    <>
      <h1>길드</h1>
      <form
        className="grid gap-3 sm:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setPage(0);
          setSearch(
            new URLSearchParams({
              name: String(f.get("name") || ""),
              server: String(f.get("server") || ""),
              recruiting: String(f.has("recruiting")),
            }).toString(),
          );
        }}
      >
        <Field label="길드명" name="name" />
        <label>
          서버
          <select name="server">
            <option value="">전체 서버</option>
            {["류트", "하프", "만돌린", "울프"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="recruiting-filter">
          <input type="checkbox" name="recruiting" />
          모집 중인 길드만
        </label>
        <button className="self-end rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground">
          검색
        </button>
      </form>
      <Notice pending={list.isLoading} error={list.error} />
      <div className="grid gap-3 sm:grid-cols-2">
        {list.data?.map((g) => (
          <article key={g.id}>
            <span>
              {g.server} · {g.recruiting ? "모집 중" : "길드"}
            </span>
            <h2>
              <Link href={"/guilds/" + g.id}>{g.name}</Link>
            </h2>
            <p>{g.tagline}</p>
          </article>
        ))}
      </div>
      {list.data?.length === 0 && <p>조건에 맞는 길드가 없습니다.</p>}
      {(page > 0 || list.data?.length === 30) && (
        <nav aria-label="길드 목록 페이지" className="flex items-center gap-4">
          <button disabled={!page} onClick={() => setPage(page - 1)}>
            이전
          </button>
          <span>{page + 1}쪽</span>
          <button
            disabled={list.data?.length !== 30}
            onClick={() => setPage(page + 1)}
          >
            다음
          </button>
        </nav>
      )}
      <section>
        <h2>길드 등록 신청</h2>
        {user ? (
          <>
            <Notice
              pending={verification.isLoading}
              error={verification.error}
            />
            {verification.data?.verified ? (
              <Action
                label="등록 신청"
                run={(f) =>
                  api("guilds/registrations", "POST", {
                    name: f.get("name"),
                    description: f.get("description"),
                  })
                }
              >
                <label>
                  인증 서버
                  <input value={verification.data.serverName ?? ""} readOnly />
                </label>
                <p>{verification.data.characterName}</p>
                <Field name="name" label="등록할 길드명" required />
                <Field name="description" label="신청 설명" long required />
              </Action>
            ) : (
              <Link href="/mypage">마이페이지에서 인게임 인증하기</Link>
            )}
          </>
        ) : (
          <Link href="/sign-in">로그인 후 등록 신청</Link>
        )}
      </section>
      {user && (
        <section>
          <h2>내 신청</h2>
          <Notice
            pending={registrations.isLoading || applications.isLoading}
            error={registrations.error || applications.error}
          />
          {registrations.data?.map((r) => (
            <article key={r.id}>
              <h3>
                {r.name} 등록 · {statusNames[r.status]}
              </h3>
              {r.reason && <p>{r.reason}</p>}
              {r.guildId && <Link href={"/guilds/" + r.guildId}>길드홈</Link>}
              {r.status === "PENDING" && (
                <Action
                  label="등록 신청 취소"
                  run={() => api("guilds/registrations/" + r.id, "DELETE")}
                />
              )}
            </article>
          ))}
          {applications.data?.map((a) => (
            <article key={a.id}>
              <h3>
                <Link href={"/guilds/" + a.guildId}>
                  {a.guildName || "길드홈"}
                </Link>{" "}
                · {statusNames[a.status]}
              </h3>
              {a.status === "PENDING" && (
                <Action
                  label="지원 취소"
                  run={() =>
                    api(
                      "guilds/" +
                        a.guildId +
                        "/recruitments/" +
                        a.recruitmentId +
                        "/applications/" +
                        a.id +
                        "/cancel",
                      "POST",
                    )
                  }
                />
              )}
            </article>
          ))}
          {registrations.data?.length === 0 &&
            applications.data?.length === 0 && (
              <p>아직 신청 내역이 없습니다.</p>
            )}
        </section>
      )}
    </>
  );
}
