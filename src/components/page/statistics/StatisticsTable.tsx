"use client";

import { StatisticsBase } from "@/types/statistics";

interface StatisticsTableProps {
  data: (StatisticsBase & {
    date?: string;
    weekStart?: string;
    weekEnd?: string;
  })[];
  isWeekly: boolean;
}

function formatPrice(value: number): string {
  return value.toLocaleString("ko-KR");
}

export default function StatisticsTable({
  data,
  isWeekly,
}: StatisticsTableProps) {
  if (data.length === 0) return null;

  return (
    <div className="bg-white dark:bg-navy-700 rounded-2xl shadow-xl border border-gray-100 dark:border-navy-600 overflow-hidden">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 p-4 md:p-6 pb-0 md:pb-0">
        상세 데이터
      </h3>

      {/* Desktop/Tablet Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-navy-600">
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                {isWeekly ? "기간" : "날짜"}
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                최저가
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                최고가
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                평균가
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                거래금액
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                거래수량
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const dateLabel = isWeekly
                ? `${item.weekStart} ~ ${item.weekEnd}`
                : item.date ?? "";

              return (
                <tr
                  key={index}
                  className="border-b border-gray-50 dark:border-navy-600/50 hover:bg-gray-50 dark:hover:bg-navy-600/50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">
                    {dateLabel}
                  </td>
                  <td className="px-4 py-3 text-right text-blaanid-600 dark:text-coral-400">
                    {formatPrice(item.minPrice)}
                  </td>
                  <td className="px-4 py-3 text-right text-gold-600 dark:text-gold-400">
                    {formatPrice(item.maxPrice)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                    {formatPrice(item.avgPrice)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                    {formatPrice(item.totalVolume)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                    {item.totalQuantity.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden p-4 space-y-3">
        {data.map((item, index) => {
          const dateLabel = isWeekly
            ? `${item.weekStart} ~ ${item.weekEnd}`
            : item.date ?? "";

          return (
            <div
              key={index}
              className="p-3 rounded-xl bg-gray-50 dark:bg-navy-600/50 space-y-2"
            >
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {dateLabel}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">최저가</span>
                  <div className="font-medium text-blaanid-600 dark:text-coral-400">
                    {formatPrice(item.minPrice)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">최고가</span>
                  <div className="font-medium text-gold-600 dark:text-gold-400">
                    {formatPrice(item.maxPrice)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">평균가</span>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {formatPrice(item.avgPrice)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">거래수량</span>
                  <div className="font-medium text-gray-700 dark:text-gray-300">
                    {item.totalQuantity.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
