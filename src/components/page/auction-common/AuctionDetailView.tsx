"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import ItemOptionPopover from "@/components/page/auction-history/ItemOptionPopover";
import ItemMetadata from "@/components/page/items/ItemMetadata";
import PriceChart from "@/components/page/statistics/PriceChart";
import StatisticsSummaryCards from "@/components/page/statistics/StatisticsSummaryCards";
import VolumeChart from "@/components/page/statistics/VolumeChart";
import { AuctionDetailResult, AuctionRecord } from "@/lib/auction/detail";
import { itemPath } from "@/lib/items/identity";

interface Props {
  result: AuctionDetailResult;
  returnTo: string;
}

function dateLabel(value: string) {
  if (!Number.isFinite(Date.parse(value))) return "일시 정보 없음";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
        {value}
      </dd>
    </div>
  );
}

function RecordFacts({ record }: { record: AuctionRecord }) {
  const history = "dateAuctionBuy" in record;
  return (
    <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <DetailField label="아이템명" value={record.itemName} />
      <DetailField
        label="카테고리"
        value={`${record.itemTopCategory} › ${record.itemSubCategory}`}
      />
      <DetailField label="수량" value={record.itemCount} />
      <DetailField
        label="개당 가격"
        value={`${record.auctionPricePerUnit.toLocaleString("ko-KR")} Gold`}
      />
      {history ? (
        <DetailField
          label="거래 일시"
          value={dateLabel(record.dateAuctionBuy)}
        />
      ) : (
        <>
          <DetailField
            label="등록 일시"
            value={dateLabel(record.dateRegister)}
          />
          <DetailField
            label="만료 일시"
            value={dateLabel(record.dateAuctionExpire)}
          />
        </>
      )}
    </dl>
  );
}

export default function AuctionDetailView({ result, returnTo }: Props) {
  const router = useRouter();
  const [period, setPeriod] = useState<"daily" | "weekly">("daily");
  if (result.status !== "available" || !result.record) {
    const message =
      result.source === "realtime" && result.status === "not-found"
        ? "판매가 종료되었거나 최신 목록에서 제외되었습니다."
        : result.status === "not-found"
          ? "거래 내역을 찾을 수 없습니다."
          : "상세 정보를 불러오지 못했습니다.";
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-8 text-center dark:bg-navy-800">
        <h1 className="text-xl font-bold">{message}</h1>
        <Link
          className="mt-6 inline-flex rounded-lg bg-[var(--color-ds-primary)] px-5 py-3 font-semibold text-primary-foreground"
          href={returnTo}
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }
  const record = result.record;
  const statistics =
    period === "daily" ? result.dailyStatistics : result.weeklyStatistics;
  const statisticsStatus =
    period === "daily" ? result.dailyStatus : result.weeklyStatus;
  return (
    <main className="mx-auto max-w-6xl space-y-6 pb-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--color-ds-primary)]">
            {result.source === "history"
              ? "경매장 거래 내역"
              : "경매장 실시간 거래"}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-950 md:text-3xl dark:text-white">
            {record.itemName}
          </h1>
        </div>
        <Link
          href={returnTo}
          className="shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-navy-700"
        >
          목록으로 돌아가기
        </Link>
      </div>
      <section className="rounded-2xl border bg-white p-5 dark:bg-navy-800">
        <h2 className="mb-4 text-lg font-bold">거래 기본 정보</h2>
        <RecordFacts record={record} />
        <div className="mt-6 rounded-xl border bg-gray-50 p-4 dark:bg-navy-700">
          <ItemOptionPopover
            itemDisplayName={record.itemDisplayName}
            itemOptions={record.itemOptions}
            price={record.auctionPricePerUnit}
          />
        </div>
      </section>
      <section className="rounded-2xl border bg-white p-5 dark:bg-navy-800">
        <h2 className="mb-4 text-lg font-bold">아이템 정보</h2>
        {result.itemInfoStatus === "available" && result.itemInfo ? (
          <>
            <ItemMetadata info={result.itemInfo} />
            <Link
              href={itemPath(result.itemInfo)}
              className="mt-4 inline-flex min-h-11 items-center font-medium text-primary underline"
            >
              아이템 시세와 정보 보기
            </Link>
          </>
        ) : result.itemInfoStatus === "error" ? (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-red-600">
              아이템 정보를 불러오지 못했습니다.
            </p>
            <button
              type="button"
              className="rounded-lg border px-3 py-2 text-sm font-semibold"
              onClick={() => router.refresh()}
            >
              다시 시도
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            등록된 아이템 정보가 없습니다.
          </p>
        )}
      </section>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">시세 정보</h2>
          <div className="flex rounded-lg border bg-white p-1 dark:bg-navy-800">
            {(["daily", "weekly"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                aria-pressed={period === value}
                className={`min-h-11 rounded-md px-3 py-1.5 text-sm font-medium ${period === value ? "bg-[var(--color-ds-primary)] text-primary-foreground" : "text-muted-foreground"}`}
              >
                {value === "daily" ? "최근 30일" : "최근 120일"}
              </button>
            ))}
          </div>
        </div>
        {statisticsStatus === "error" ? (
          <div className="flex items-center justify-between gap-4 rounded-xl border bg-white p-4 dark:bg-navy-800">
            <p className="text-sm text-red-600">
              선택한 기간의 시세 정보를 불러오지 못했습니다.
            </p>
            <button
              type="button"
              className="rounded-lg border px-3 py-2 text-sm font-semibold"
              onClick={() => router.refresh()}
            >
              다시 시도
            </button>
          </div>
        ) : statisticsStatus === "empty" ? (
          <p className="rounded-xl border bg-white p-8 text-center text-gray-500 dark:bg-navy-800">
            시세 데이터가 없습니다.
          </p>
        ) : (
          <>
            <StatisticsSummaryCards data={statistics} />
            <PriceChart data={statistics} />
            <VolumeChart data={statistics} />
          </>
        )}
      </section>
    </main>
  );
}
