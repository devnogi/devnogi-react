"use client";

interface StatisticsChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{
    name?: string;
    value?: number | string;
    color?: string;
    payload?: {
      date?: string;
      dateAuctionBuy?: string;
      weekStart?: string;
      weekEnd?: string;
      [key: string]: unknown;
    };
  }>;
  mode: "price" | "volume";
  isDarkMode: boolean;
}

function formatPrice(value: number): string {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만`;
  return value.toLocaleString("ko-KR");
}

function formatPeriod(date?: string, weekStart?: string, weekEnd?: string): string {
  if (date) return date;
  if (weekStart && weekEnd) return `${weekStart} ~ ${weekEnd}`;
  if (weekStart) return weekStart;
  return "-";
}

function getDisplayName(name?: string, mode?: "price" | "volume"): string {
  if (mode === "price") {
    if (name === "minPrice") return "최저가";
    if (name === "maxPrice") return "최고가";
    if (name === "avgPrice") return "평균가";
  }
  if (mode === "volume") {
    if (name === "totalVolume") return "총 거래금액";
    if (name === "totalQuantity") return "총 거래수량";
  }
  return name ?? "-";
}

export default function StatisticsChartTooltip({
  active,
  label,
  payload,
  mode,
  isDarkMode,
}: StatisticsChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const source = payload[0]?.payload;
  const period = formatPeriod(
    source?.date ?? source?.dateAuctionBuy,
    source?.weekStart,
    source?.weekEnd,
  );
  const displayPeriod =
    period !== "-"
      ? period
      : typeof label === "string" && label.length > 0
        ? label
        : "-";

  return (
    <div
      className="rounded-xl border px-3 py-2 shadow-lg"
      style={{
        backgroundColor: isDarkMode ? "#1a1a2e" : "#FFFFFF",
        borderColor: isDarkMode ? "#2a2a45" : "#E5E7EB",
        color: isDarkMode ? "#F9FAFB" : "#111827",
      }}
    >
      <div className="text-xs font-semibold mb-2">일자: {displayPeriod}</div>
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const numericValue =
            typeof entry.value === "number" ? entry.value : Number(entry.value ?? 0);
          const valueText =
            mode === "volume" && entry.name === "totalQuantity"
              ? numericValue.toLocaleString("ko-KR")
              : formatPrice(numericValue);

          return (
            <div key={`${entry.name ?? "series"}-${index}`} className="flex items-center gap-2 text-xs">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color ?? (isDarkMode ? "#9CA3AF" : "#6B7280") }}
              />
              <span>{getDisplayName(entry.name, mode)}:</span>
              <span className="font-semibold">{valueText}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
