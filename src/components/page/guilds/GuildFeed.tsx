"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import type { UserVerificationInfoResponse } from "@/types/verification";

import {
  Action,
  api,
  type Application,
  type Entry,
  Field,
  type Guild,
  Notice,
  statusNames,
  upload,
  useGuildData,
} from "./shared";

type Kind = "posts" | "recruitments";
function Editor({
  path,
  kind,
  entry,
}: {
  path: string;
  kind: Kind;
  entry?: Entry;
}) {
  const [photoPath, setPhotoPath] = useState("");
  return (
    <details>
      <summary>
        {entry ? "글 수정" : kind === "posts" ? "추억 남기기" : "모집글 작성"}
      </summary>
      <Action
        label="저장"
        run={async (f) => {
          const body = {
            title: f.get("title"),
            body: f.get("body"),
            ...(kind === "posts"
              ? { visibility: f.get("visibility") }
              : { requirements: f.get("requirements") }),
          };
          await api(
            entry ? path + "/" + entry.id : path,
            entry ? "PUT" : "POST",
            body,
          ).then((result) => {
            if (kind === "posts" && !entry)
              setPhotoPath(
                path + "/" + (result as { id: number }).id + "/photo",
              );
          });
        }}
      >
        <Field name="title" label="제목" value={entry?.title} required />
        <Field long name="body" label="내용" value={entry?.body} required />
        {kind === "posts" ? (
          <label>
            공개 범위
            <select
              name="visibility"
              defaultValue={entry?.visibility || "MEMBERS"}
            >
              <option value="MEMBERS">길드원 전용</option>
              <option value="PUBLIC">전체 공개</option>
            </select>
          </label>
        ) : (
          <Field
            name="requirements"
            label="지원 조건"
            value={entry?.requirements}
          />
        )}
      </Action>
      {kind === "posts" && (photoPath || entry) && (
        <Action
          label="사진 저장"
          run={(f) =>
            upload(
              entry ? path + "/" + entry.id + "/photo" : photoPath,
              f.get("file") as File,
            )
          }
        >
          <label>
            추억 사진
            <input
              required
              type="file"
              name="file"
              accept="image/jpeg,image/png,image/webp"
            />
          </label>
        </Action>
      )}
    </details>
  );
}
function Support({
  path,
  operator,
  eligible,
}: {
  path: string;
  operator: boolean;
  eligible: boolean;
}) {
  const [show, setShow] = useState(false);
  const apps = useGuildData<Application[]>(path, show && operator);
  return (
    <>
      {eligible && (
        <Action
          label="지원하기"
          run={(f) => api(path, "POST", { message: f.get("message") })}
        >
          <Field name="message" label="지원 메시지 (선택)" long />
        </Action>
      )}
      {operator && (
        <>
          <button onClick={() => setShow(!show)}>
            {show ? "지원자 닫기" : "지원자 보기"}
          </button>
          {show && (
            <>
              <Notice pending={apps.isLoading} error={apps.error} />
              {apps.data?.map((a) => (
                <article key={a.id}>
                  <strong>{a.characterName}</strong> · {statusNames[a.status]}
                  <p>{a.message}</p>
                  {a.status === "PENDING" && (
                    <>
                      <Action
                        label="수락"
                        run={() => api(path + "/" + a.id + "/accept", "POST")}
                      />
                      <Action
                        label="거절"
                        run={() => api(path + "/" + a.id + "/reject", "POST")}
                      />
                    </>
                  )}
                </article>
              ))}
              {apps.data?.length === 0 && <p>지원자가 없습니다.</p>}
            </>
          )}
        </>
      )}
    </>
  );
}
export default function GuildFeed({
  base,
  guild,
  kind,
  entryId,
}: {
  base: string;
  guild: Guild;
  kind: Kind;
  entryId?: string;
}) {
  const path = base + "/" + kind;
  const [page, setPage] = useState<number | null>(null);
  const entries = useGuildData<Entry[]>(
    path + "?page=" + (page ?? 0),
    !entryId && page !== null,
  );
  const detail = useGuildData<Entry>(path + "/" + entryId, !!entryId);
  const { user } = useAuth();
  const verification = useGuildData<UserVerificationInfoResponse>(
    "user/verification/info",
    !!user && !guild.viewerRole && kind === "recruitments",
  );
  const applications = useGuildData<Application[]>(
    "guilds/my/applications",
    !!user && !guild.viewerRole && kind === "recruitments",
  );
  const operator =
    guild.viewerRole === "MASTER" || guild.viewerRole === "DEPUTY";
  const isPost = kind === "posts";
  const initial = isPost ? guild.posts : guild.recruitments;
  const visible = entryId
    ? detail.data
      ? [detail.data]
      : []
    : (entries.data ?? initial ?? []);
  return (
    <section>
      <h2>{isPost ? "길드의 추억" : "길드원 모집"}</h2>
      {!entryId && (isPost ? !!guild.viewerRole : operator) && (
        <Editor kind={kind} path={path} />
      )}
      <Notice pending={entries.isLoading && !initial} error={entries.error} />
      {entryId && <Notice pending={detail.isLoading} error={detail.error} />}
      {visible.map((e) => {
        const application = applications.data?.find(
          (a) =>
            a.recruitmentId === e.id &&
            a.status !== "CANCELLED" &&
            a.status !== "REJECTED",
        );
        const editable = isPost
          ? !!guild.viewerRole && e.authorId === user?.userId
          : operator;
        return (
          <article key={e.id}>
            <h3>
              {entryId ? (
                e.title
              ) : (
                <Link href={"/" + path + "/" + e.id}>{e.title}</Link>
              )}
            </h3>
            <small>
              {isPost
                ? e.visibility === "MEMBERS"
                  ? "길드원 전용"
                  : "전체 공개"
                : statusNames[e.status || "OPEN"]}
            </small>
            <p>{e.body}</p>
            {isPost && !!e.hasPhoto && (
              <Image
                unoptimized
                alt={e.title + " 사진"}
                width={800}
                height={450}
                className="h-auto max-w-full"
                src={"/api/" + path + "/" + e.id + "/photo"}
              />
            )}
            {!isPost && (
              <>
                <p>{e.requirements}</p>
                {application && (
                  <p>내 지원 · {statusNames[application.status]}</p>
                )}
                <Support
                  path={path + "/" + e.id + "/applications"}
                  operator={operator}
                  eligible={
                    e.status === "OPEN" &&
                    !guild.viewerRole &&
                    !application &&
                    verification.data?.verified === true &&
                    verification.data.serverName === guild.server
                  }
                />
                {e.status === "OPEN" && !guild.viewerRole && !user && (
                  <Link href="/sign-in">로그인 후 지원</Link>
                )}
                {e.status === "OPEN" && operator && (
                  <Action
                    label="모집 마감"
                    run={() => api(path + "/" + e.id + "/close", "POST")}
                  />
                )}
              </>
            )}
            {editable && (
              <>
                <Editor kind={kind} path={path} entry={e} />
                <Action
                  label="글 삭제"
                  run={async () => {
                    if (!window.confirm("글을 삭제하시겠습니까?"))
                      throw new Error("삭제를 취소했습니다.");
                    await api(path + "/" + e.id, "DELETE");
                  }}
                />
              </>
            )}
          </article>
        );
      })}
      {!entryId && (entries.data ?? initial)?.length === 0 && (
        <p>
          {isPost ? "등록된 추억글이 없습니다." : "등록된 모집글이 없습니다."}
        </p>
      )}
      {!entryId && (
        <div className="flex gap-4">
          {page === null ? (
            <button onClick={() => setPage(0)}>
              전체 {isPost ? "추억글" : "모집글"} 보기
            </button>
          ) : (
            <>
              <button onClick={() => setPage(null)}>최신 글 보기</button>
              {page > 0 && (
                <button onClick={() => setPage(page - 1)}>이전</button>
              )}
              {entries.data?.length === 30 && (
                <button onClick={() => setPage(page + 1)}>다음</button>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
