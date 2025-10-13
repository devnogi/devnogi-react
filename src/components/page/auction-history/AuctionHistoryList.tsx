"use client";

import { AuctionHistoryItem } from "@/hooks/useAuctionHistory";
import { Badge } from "@/components/ui/badge";

interface AuctionHistoryListProps {
  items: AuctionHistoryItem[];
  isLoading?: boolean;
}

export default function AuctionHistoryList({
  items,
  isLoading = false,
}: AuctionHistoryListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
          <p className="text-gray-400 text-sm mt-2">
            다른 검색 조건으로 시도해보세요.
          </p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={`${item.auctionBuyId}-${index}`}
          className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Item Name */}
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.itemDisplayName}
                </h3>
                {item.itemName !== item.itemDisplayName && (
                  <span className="text-sm text-gray-500">
                    ({item.itemName})
                  </span>
                )}
              </div>

              {/* Category */}
              <div className="flex items-center gap-2 mb-3">
                <Badge
                  variant="secondary"
                  className="rounded-lg bg-blue-50 text-blue-700 border-0"
                >
                  {item.itemTopCategory}
                </Badge>
                <span className="text-gray-400">›</span>
                <Badge
                  variant="secondary"
                  className="rounded-lg bg-purple-50 text-purple-700 border-0"
                >
                  {item.itemSubCategory}
                </Badge>
              </div>

              {/* Item Options */}
              {item.itemOptions.length > 0 && (
                <div className="space-y-1 mb-3">
                  {item.itemOptions
                    .filter(
                      (opt) =>
                        !opt.optionType.includes("색상") &&
                        opt.optionType !== "아이템 색상",
                    )
                    .slice(0, 5)
                    .map((option, idx) => (
                      <div key={option.id} className="text-sm text-gray-600">
                        <span className="font-medium">{option.optionType}</span>
                        {option.optionSubType && (
                          <span className="text-gray-500">
                            {" "}
                            ({option.optionSubType})
                          </span>
                        )}
                        : <span className="text-gray-900">{option.optionValue}</span>
                        {option.optionValue2 && (
                          <span className="text-gray-900">
                            {" "}
                            ~ {option.optionValue2}
                          </span>
                        )}
                      </div>
                    ))}
                  {item.itemOptions.filter(
                    (opt) =>
                      !opt.optionType.includes("색상") &&
                      opt.optionType !== "아이템 색상",
                  ).length > 5 && (
                    <div className="text-sm text-gray-400">
                      +
                      {item.itemOptions.filter(
                        (opt) =>
                          !opt.optionType.includes("색상") &&
                          opt.optionType !== "아이템 색상",
                      ).length - 5}{" "}
                      more...
                    </div>
                  )}
                </div>
              )}

              {/* Date */}
              <div className="text-sm text-gray-500">
                거래일시: {formatDate(item.dateAuctionBuy)}
              </div>
            </div>

            {/* Price */}
            <div className="text-right ml-6">
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(item.auctionPricePerUnit)}
              </div>
              <div className="text-sm text-gray-500 mt-1">골드</div>
              {item.itemCount > 1 && (
                <div className="text-xs text-gray-400 mt-1">
                  수량: {item.itemCount}개
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
