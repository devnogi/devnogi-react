"use client";

import { StatisticsBase } from "@/types/statistics";

interface StatisticsSummaryCardsProps {
  data: StatisticsBase[];
}

function formatPrice(value: number): string {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
  if (value >= 10000) return `${Math.floor(value / 10000)}만`;
  return value.toLocaleString("ko-KR");
}

export default function StatisticsSummaryCards({
  data,
}: StatisticsSummaryCardsProps) {
  if (data.length === 0) return null;

  const overallAvg =
    data.reduce((sum, d) => sum + d.avgPrice, 0) / data.length;
  const overallMax = Math.max(...data.map((d) => d.maxPrice));
  const overallMin = Math.min(...data.map((d) => d.minPrice));
  const totalVolume = data.reduce((sum, d) => sum + d.totalVolume, 0);
  const totalQuantity = data.reduce((sum, d) => sum + d.totalQuantity, 0);

  const cards = [
    {
      label: "평균가",
      value: formatPrice(Math.round(overallAvg)),
      color: "text-blaanid-600 dark:text-coral-400",
    },
    {
      label: "최고가",
      value: formatPrice(overallMax),
      color: "text-gold-600 dark:text-gold-400",
    },
    {
      label: "최저가",
      value: formatPrice(overallMin),
      color: "text-blaanid-500 dark:text-coral-300",
    },
    {
      label: "총 거래량",
      value: `${totalQuantity.toLocaleString()}건`,
      sub: formatPrice(totalVolume),
      color: "text-gray-900 dark:text-gray-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white dark:bg-navy-700 rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-navy-600"
        >
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {card.label}
          </div>
          <div className={`text-lg md:text-xl font-bold ${card.color}`}>
            {card.value}
          </div>
          {card.sub && (
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {card.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
