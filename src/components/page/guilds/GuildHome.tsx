"use client";
import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/contexts/AuthContext";

import GuildFeed from "./GuildFeed";
import {
  Action,
  api,
  Field,
  type Guild,
  Notice,
  statusNames,
  upload,
  useGuildData,
} from "./shared";

const themes: Record<string, string> = {
  FOREST: "#286447",
  SKY: "#315f91",
  ROSE: "#924567",
  GOLD: "#836523",
};
export default function GuildHome({ id }: { id: string }) {
  const base = "guilds/" + id;
  const guild = useGuildData<Guild>(base);
  const g = guild.data;
  const members = useGuildData<
    { userId: number; nickname: string; role: string }[]
  >(base + "/members", !!g?.viewerRole);
  const { user } = useAuth();
  if (!g) return <Notice pending={guild.isPending} error={guild.error} />;
  return (
    <>
      <Link href="/guilds">길드 목록</Link>
      <section
        style={{ borderTop: "6px solid " + (themes[g.theme] || themes.FOREST) }}
      >
        {!!g.hasBanner && (
          <Image
            unoptimized
            alt=""
            width={960}
            height={240}
            className="max-h-64 w-full rounded-xl object-cover"
            src={"/api/" + base + "/media/banner"}
          />
        )}
        {!!g.hasEmblem && (
          <Image
            unoptimized
            alt="길드 엠블럼"
            width={64}
            height={64}
            src={"/api/" + base + "/media/emblem"}
          />
        )}
        <p>
          {g.server} · {g.recruiting ? "모집 중" : "길드"}
        </p>
        <h1>{g.name}</h1>
        <h2>{g.tagline}</h2>
        <p>{g.description}</p>
        <p>{g.tags}</p>
        {g.activityTime && <p>활동 시간 · {g.activityTime}</p>}
      </section>
      {g.canEdit && (
        <section>
          <details>
            <summary>길드홈 꾸미기</summary>
            <Action
              label="소개 저장"
              run={(f) => api(base + "/profile", "PUT", Object.fromEntries(f))}
            >
              <Field name="tagline" label="한 줄 소개" value={g.tagline} />
              <Field
                name="description"
                label="상세 소개"
                value={g.description}
                long
              />
              <Field
                name="tags"
                label="성향 태그 (쉼표로 구분)"
                value={g.tags}
              />
              <Field
                name="activityTime"
                label="주 활동 시간"
                value={g.activityTime}
              />
              <label>
                테마 색상
                <select name="theme" defaultValue={g.theme || "FOREST"}>
                  {Object.keys(themes).map((t, i) => (
                    <option key={t} value={t}>
                      {["숲", "하늘", "장미", "금빛"][i]}
                    </option>
                  ))}
                </select>
              </label>
            </Action>
            {["banner", "emblem"].map((type) => (
              <Action
                key={type}
                label="이미지 저장"
                run={(f) =>
                  upload(base + "/media/" + type, f.get("file") as File)
                }
              >
                <label>
                  {type === "banner" ? "배너" : "엠블럼"} 이미지
                  <input
                    required
                    type="file"
                    name="file"
                    accept="image/jpeg,image/png,image/webp"
                  />
                </label>
              </Action>
            ))}
          </details>
        </section>
      )}
      <GuildFeed base={base} guild={g} kind="recruitments" />
      <GuildFeed base={base} guild={g} kind="posts" />
      {g.viewerRole && (
        <section>
          <details>
            <summary>길드원 명단 · {statusNames[g.viewerRole]}</summary>
            <Notice pending={members.isLoading} error={members.error} />
            {members.data?.map((m) => (
              <article key={m.userId}>
                <strong>{m.nickname}</strong> · {statusNames[m.role]}
                {g.viewerRole === "MASTER" && m.role !== "MASTER" && (
                  <Action
                    label={
                      m.role === "DEPUTY" ? "부마스터 해제" : "부마스터 임명"
                    }
                    run={() =>
                      api(base + "/members/" + m.userId + "/role", "PUT", {
                        role: m.role === "DEPUTY" ? "MEMBER" : "DEPUTY",
                      })
                    }
                  />
                )}
              </article>
            ))}
            <Action
              label="길드 탈퇴"
              run={async () => {
                if (!window.confirm("길드를 탈퇴하시겠습니까?"))
                  throw new Error("탈퇴를 취소했습니다.");
                await api(base + "/members/me", "DELETE");
              }}
            />
          </details>
        </section>
      )}
      {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
        <Link href="/admin/guilds">길드 관리</Link>
      )}
    </>
  );
}
