"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { heroRequest } from "@/lib/hero/request";
import type { AdminHeroCreativesResponse } from "@/types/hero";

import HeroAdminCreativeCard from "./HeroAdminCreativeCard";

export default function HeroAdminCreatives({
  userId,
  onChanged,
}: {
  userId: number;
  onChanged: () => Promise<unknown>;
}) {
  const [draft, setDraft] = useState("");
  const [filters, setFilters] = useState({ page: 0, query: "", status: "ALL" });
  const parameters = new URLSearchParams({
    page: String(filters.page),
    size: "20",
    query: filters.query,
    status: filters.status,
  });
  const creatives = useQuery({
    queryKey: ["hero", "admin", "creatives", userId, filters],
    queryFn: () =>
      heroRequest<AdminHeroCreativesResponse>(
        `admin/hero/creatives/search?${parameters}`,
      ),
    refetchInterval: 30_000,
  });
  const totalPages = creatives.data?.totalPages;
  useEffect(() => {
    if (totalPages !== undefined && filters.page >= Math.max(1, totalPages)) {
      setFilters((current) => ({
        ...current,
        page: Math.max(0, totalPages - 1),
      }));
    }
  }, [filters.page, totalPages]);
  return (
    <section
      id="advertisement-images"
      aria-labelledby="advertisement-images-heading"
      className="scroll-mt-32 space-y-4 rounded-xl border bg-card p-4 sm:p-5"
    >
      <h2 id="advertisement-images-heading" className="text-xl font-semibold">
        광고 이미지 관리
      </h2>
      <p className="text-sm text-muted-foreground">
        전체 등록 이미지를 검색하고 사용 현황을 확인합니다. 차단은 입찰·광고를
        중단하며 환불하지 않습니다. 차단 해제 후에도 중단된 입찰과 광고는
        복구되지 않습니다.
      </p>
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setFilters((current) => ({
            ...current,
            query: draft.trim(),
            page: 0,
          }));
        }}
      >
        <label className="min-w-0 flex-1 basis-60 text-sm">
          광고 이미지 검색
          <input
            type="search"
            maxLength={100}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="이미지 설명, 닉네임, 링크 또는 ID"
            className="mt-1 block min-h-11 w-full rounded-md border border-input bg-background p-2"
          />
        </label>
        <label className="text-sm">
          광고 이미지 상태
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: event.target.value,
                page: 0,
              }))
            }
            className="mt-1 block min-h-11 rounded-md border border-input bg-background p-2"
          >
            <option value="ALL">전체</option>
            <option value="AVAILABLE">사용 가능</option>
            <option value="BLOCKED">차단됨</option>
          </select>
        </label>
        <Button type="submit" className="min-h-11">
          검색
        </Button>
      </form>
      {creatives.isPending ? (
        <p role="status">광고 이미지 불러오는 중…</p>
      ) : null}
      {creatives.isError ? (
        <div role="alert" className="space-y-2">
          <p>{creatives.error.message}</p>
          <Button
            className="min-h-11"
            variant="outline"
            onClick={() => void creatives.refetch()}
          >
            광고 이미지 다시 불러오기
          </Button>
        </div>
      ) : null}
      {creatives.data ? (
        <>
          <p role="status" className="text-sm text-muted-foreground">
            총 {creatives.data.totalElements.toLocaleString()}개
          </p>
          {!creatives.data.items.length ? (
            <p>조건에 맞는 광고 이미지가 없습니다.</p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            {creatives.data.items.map((creative) => (
              <HeroAdminCreativeCard
                key={creative.id}
                creative={creative}
                onChanged={onChanged}
              />
            ))}
          </div>
          <nav
            aria-label="광고 이미지 페이지"
            className="flex flex-wrap items-center justify-between gap-3"
          >
            <Button
              variant="outline"
              className="min-h-11"
              disabled={filters.page === 0 || creatives.isFetching}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: current.page - 1,
                }))
              }
            >
              이전 페이지
            </Button>
            <span className="text-sm">
              {filters.page + 1} / {Math.max(1, creatives.data.totalPages)}{" "}
              페이지
            </span>
            <Button
              variant="outline"
              className="min-h-11"
              disabled={
                filters.page + 1 >= creatives.data.totalPages ||
                creatives.isFetching
              }
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: current.page + 1,
                }))
              }
            >
              다음 페이지
            </Button>
          </nav>
        </>
      ) : null}
    </section>
  );
}
