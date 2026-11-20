"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import HeroAdminAuctions from "@/components/page/hero/admin/HeroAdminAuctions";
import HeroAdminCreatives from "@/components/page/hero/admin/HeroAdminCreatives";
import HeroAdminPreview from "@/components/page/hero/admin/HeroAdminPreview";
import HeroAdminSlides from "@/components/page/hero/admin/HeroAdminSlides";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminRole } from "@/utils/roles";

export default function HeroAdministration() {
  const { user, isLoading } = useAuth();
  const cache = useQueryClient();
  async function changed() {
    await Promise.all([
      cache.invalidateQueries({ queryKey: ["hero"] }),
      cache.invalidateQueries({ queryKey: ["experience"] }),
    ]);
  }
  if (isLoading) return <p role="status">권한 확인 중…</p>;
  if (!user || !isAdminRole(user.role))
    return <p role="alert">관리자 계정으로 로그인해야 합니다.</p>;
  return (
    <main className="mx-auto max-w-5xl space-y-6 py-5">
      <header className="space-y-3">
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
        >
          운영자 작업 콘솔
        </Link>
        <h1 className="text-2xl font-bold sm:text-3xl">
          메인 Hero·광고 경매 관리
        </h1>
        <p className="text-sm text-muted-foreground">
          기본 이미지 1~10개 · 낙찰 광고는 1·2번 위치에 우선 배치 · 모든 일정은
          한국 시간
        </p>
        <nav aria-label="Hero 관리 메뉴" className="flex flex-wrap gap-2">
          {[
            ["default-images", "기본 이미지"],
            ["advertisement-images", "광고 이미지"],
            ["display-preview", "노출 미리보기"],
            ["auction-operations", "경매 현황"],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="inline-flex min-h-11 items-center rounded-md border px-3 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
            >
              {label}
            </a>
          ))}
        </nav>
      </header>
      <HeroAdminSlides userId={user.userId} onChanged={changed} />
      <HeroAdminCreatives userId={user.userId} onChanged={changed} />
      <HeroAdminPreview userId={user.userId} />
      <HeroAdminAuctions userId={user.userId} onChanged={changed} />
    </main>
  );
}
