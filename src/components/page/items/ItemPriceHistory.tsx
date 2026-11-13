"use client";

import { useState } from "react";

import PriceChart from "@/components/page/statistics/PriceChart";
import VolumeChart from "@/components/page/statistics/VolumeChart";
import type { ItemStatistics } from "@/lib/items/data";

const number = (value: number) => Math.round(value).toLocaleString("ko-KR");

export default function ItemPriceHistory({
  statistics,
}: {
  statistics: ItemStatistics;
}) {
  const [period, setPeriod] = useState<"daily" | "weekly">("daily");
  const rows =
    period === "daily"
      ? statistics.dailyStatistics
      : statistics.weeklyStatistics;
  const status =
    period === "daily" ? statistics.dailyStatus : statistics.weeklyStatus;
  const quantity = rows.reduce((sum, row) => sum + row.totalQuantity, 0);
  const amount = rows.reduce((sum, row) => sum + row.totalVolume, 0);
  return (
    <section className="space-y-4" aria-labelledby="item-price-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="item-price-heading" className="text-xl font-semibold">
          기간별 시세
        </h2>
        <div className="flex gap-2">
          {(["daily", "weekly"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={period === value}
              className="min-h-11 rounded-lg border px-4 text-sm aria-pressed:bg-primary aria-pressed:text-primary-foreground"
              onClick={() => setPeriod(value)}
            >
              {value === "daily" ? "최근 30일 · 일간" : "최근 120일 · 주간"}
            </button>
          ))}
        </div>
      </div>
      {status === "error" ? (
        <p role="alert">
          이 기간의 시세를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.
        </p>
      ) : status === "empty" ? (
        <p className="rounded-lg border p-6 text-muted-foreground">
          이 기간에 집계된 거래가 없습니다.
        </p>
      ) : (
        <>
          <dl className="grid grid-cols-1 gap-3 rounded-xl border bg-card p-5 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">
                수량 가중 평균 가격
              </dt>
              <dd className="mt-1 text-lg font-semibold">
                {quantity > 0
                  ? `${number(amount / quantity)} 골드`
                  : "집계 없음"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">판매 수량</dt>
              <dd className="mt-1 text-lg font-semibold">
                {number(quantity)}개
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">총 거래 금액</dt>
              <dd className="mt-1 text-lg font-semibold">
                {number(amount)} 골드
              </dd>
            </div>
          </dl>
          <PriceChart data={rows} />
          <VolumeChart data={rows} />
        </>
      )}
      {(["daily", "weekly"] as const).map((tablePeriod) => {
        const tableRows =
          tablePeriod === "daily"
            ? statistics.dailyStatistics
            : statistics.weeklyStatistics;
        const tableStatus =
          tablePeriod === "daily"
            ? statistics.dailyStatus
            : statistics.weeklyStatus;
        return (
          <details key={tablePeriod} open className="rounded-lg border p-3">
            <summary className="cursor-pointer py-2 font-medium">
              {tablePeriod === "daily"
                ? "최근 30일 일별 거래 통계"
                : "최근 120일 주별 거래 통계"}
            </summary>
            {tableStatus === "error" ? (
              <p>이 기간의 시세를 불러오지 못했습니다.</p>
            ) : tableRows.length === 0 ? (
              <p>이 기간에 집계된 거래가 없습니다.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full whitespace-nowrap text-right text-sm">
                  <caption className="px-4 py-3 text-left font-medium">
                    {tablePeriod === "daily" ? "일별" : "주별"} 거래 통계 · 골드
                  </caption>
                  <thead className="bg-muted">
                    <tr>
                      {[
                        "집계 기간",
                        "최저 가격",
                        "최고 가격",
                        "가중 평균",
                        "판매 수량",
                        "거래 금액",
                      ].map((label) => (
                        <th key={label} scope="col" className="px-4 py-3">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row) => {
                      const date =
                        "date" in row
                          ? row.date
                          : `${row.weekStart} ~ ${row.weekEnd}`;
                      return (
                        <tr key={date} className="border-t">
                          <th scope="row" className="px-4 py-3 font-normal">
                            {date}
                          </th>
                          <td className="px-4 py-3">{number(row.minPrice)}</td>
                          <td className="px-4 py-3">{number(row.maxPrice)}</td>
                          <td className="px-4 py-3">{number(row.avgPrice)}</td>
                          <td className="px-4 py-3">
                            {number(row.totalQuantity)}개
                          </td>
                          <td className="px-4 py-3">
                            {number(row.totalVolume)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </details>
        );
      })}
    </section>
  );
}
