"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";
import { StatisticsBase } from "@/types/statistics";
import StatisticsChartTooltip from "./StatisticsChartTooltip";

interface PriceChartProps {
  data: (StatisticsBase & {
    date?: string;
    dateAuctionBuy?: string;
    weekStart?: string;
    weekEnd?: string;
  })[];
}

function formatPrice(value: number): string {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만`;
  return value.toLocaleString();
}

export default function PriceChart({ data }: PriceChartProps) {
  const { isDarkMode } = useTheme();

  const chartData = data.map((item) => ({
    ...item,
    label: item.date ?? item.dateAuctionBuy ?? item.weekStart ?? "",
  }));

  const colors = isDarkMode
    ? { min: "#FF6B9D", max: "#FFB3C6", avg: "#FFCCD9", grid: "#2a2a45", text: "#9CA3AF" }
    : { min: "#3B82F6", max: "#EEB233", avg: "#7FB4FA", grid: "#E5E7EB", text: "#6B7280" };

  return (
    <div className="bg-white dark:bg-navy-700 rounded-2xl p-4 md:p-6 shadow-xl border border-gray-100 dark:border-navy-600">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
        가격 추이
      </h3>
      <div className="h-[200px] md:h-[300px] lg:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: colors.text }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: colors.text }}
              tickFormatter={formatPrice}
              tickLine={false}
              width={60}
            />
            <Tooltip
              content={(tooltipProps) => (
                <StatisticsChartTooltip
                  {...tooltipProps}
                  mode="price"
                  isDarkMode={isDarkMode}
                />
              )}
            />
            <Legend
              formatter={(value: string) =>
                value === "minPrice"
                  ? "최저가"
                  : value === "maxPrice"
                    ? "최고가"
                    : "평균가"
              }
            />
            <Line
              type="monotone"
              dataKey="minPrice"
              stroke={colors.min}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="maxPrice"
              stroke={colors.max}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="avgPrice"
              stroke={colors.avg}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
