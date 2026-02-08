"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";
import { StatisticsBase } from "@/types/statistics";

interface VolumeChartProps {
  data: (StatisticsBase & { date?: string; weekStart?: string })[];
}

function formatVolume(value: number): string {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만`;
  return value.toLocaleString();
}

export default function VolumeChart({ data }: VolumeChartProps) {
  const { isDarkMode } = useTheme();

  const chartData = data.map((item) => ({
    ...item,
    label: item.date ?? item.weekStart ?? "",
  }));

  const colors = isDarkMode
    ? { volume: "#FF6B9D", quantity: "#FFB3C6", grid: "#2a2a45", text: "#9CA3AF" }
    : { volume: "#7FB4FA", quantity: "#EEB233", grid: "#E5E7EB", text: "#6B7280" };

  return (
    <div className="bg-white dark:bg-navy-700 rounded-2xl p-4 md:p-6 shadow-xl border border-gray-100 dark:border-navy-600">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
        거래량
      </h3>
      <div className="h-[200px] md:h-[300px] lg:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: colors.text }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: colors.text }}
              tickFormatter={formatVolume}
              tickLine={false}
              width={60}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: colors.text }}
              tickLine={false}
              width={40}
            />
            <Tooltip
              formatter={(value, name) => [
                name === "totalVolume"
                  ? formatVolume(Number(value))
                  : Number(value).toLocaleString(),
                name === "totalVolume" ? "총 거래금액" : "총 거래수량",
              ]}
              contentStyle={{
                backgroundColor: isDarkMode ? "#1a1a2e" : "#FFFFFF",
                border: `1px solid ${isDarkMode ? "#2a2a45" : "#E5E7EB"}`,
                borderRadius: "12px",
                color: isDarkMode ? "#F9FAFB" : "#111827",
              }}
            />
            <Legend
              formatter={(value: string) =>
                value === "totalVolume" ? "총 거래금액" : "총 거래수량"
              }
            />
            <Bar
              yAxisId="left"
              dataKey="totalVolume"
              fill={colors.volume}
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              yAxisId="right"
              dataKey="totalQuantity"
              fill={colors.quantity}
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
