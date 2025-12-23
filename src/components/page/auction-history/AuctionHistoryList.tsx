"use client";

import { AuctionHistoryItem } from "@/hooks/useAuctionHistory";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
    if (price === 0) return "0";

    const eok = Math.floor(price / 100000000); // 억
    const man = Math.floor((price % 100000000) / 10000); // 만
    const rest = price % 10000; // 나머지

    const parts: string[] = [];

    if (eok > 0) {
      parts.push(`${eok}억`);
    }

    if (man > 0) {
      parts.push(`${man.toLocaleString("ko-KR")}만`);
    }

    if (rest > 0 || parts.length === 0) {
      parts.push(rest.toLocaleString("ko-KR"));
    }

    return parts.join(" ");
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

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Extract enchant prefix from display name (축복받은|신성한 + 접두/접미 인챈트)
  const getEnchantPrefix = (displayName: string, itemName: string) => {
    // Remove itemName from displayName to get the enchant prefix
    const prefix = displayName.replace(itemName, "").trim();
    return prefix || null;
  };

  // Extract pure item name without parentheses and their content
  const getItemNameWithoutAttributes = (itemName: string) => {
    return itemName.replace(/\s*\([^)]*\)/g, "").trim();
  };

  // Extract attributes from parentheses in item name
  const getItemAttributes = (itemName: string) => {
    const matches = itemName.match(/\(([^)]+)\)/g);
    if (!matches) return [];
    return matches.map((match) => match.replace(/[()]/g, "").trim());
  };

  return (
    <>
      {/* Mobile List Layout */}
      <div className="md:hidden">
        <div className="divide-y divide-gray-200">
          {items.map((item, index) => (
            <Popover key={`${item.auctionBuyId}-${index}`}>
              <PopoverTrigger asChild>
                <div className="py-4 hover:bg-blue-50/50 transition-colors cursor-pointer">
                  {/* 1st Line: Enchants (축복받은/신성한 + 접두/접미 인챈트) - 항상 공간 유지 */}
                  <div className="text-[10px] text-gray-600 mb-1 min-h-[14px]">
                    {getEnchantPrefix(item.itemDisplayName, item.itemName) || '\u00A0'}
                  </div>

                  {/* 2nd Line: Pure Item Name (Left) + Price (Right) */}
                  <div className="flex justify-between items-center mb-1.5">
                    <h3 className="font-semibold text-gray-900 text-[0.96rem] flex-1 mr-2">
                      {getItemNameWithoutAttributes(item.itemName)}
                    </h3>
                    <div className="flex items-center flex-shrink-0">
                      <span className="font-bold text-blue-600 text-[0.96rem]">
                        {formatPrice(item.auctionPricePerUnit)}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">G</span>
                    </div>
                  </div>

                  {/* 3rd Line: Attribute Tags (Left) + Date (Right) */}
                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {getItemAttributes(item.itemName).length > 0 ? (
                        getItemAttributes(item.itemName).map((attr, idx) => (
                          <span key={idx} className="text-xs text-gray-600">
                            #{attr}
                          </span>
                        ))
                      ) : (
                        <span></span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.itemCount > 1 && (
                        <span className="text-xs text-gray-500">
                          ×{item.itemCount}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDateShort(item.dateAuctionBuy)}
                      </span>
                    </div>
                  </div>
                </div>
              </PopoverTrigger>

            <PopoverContent
              className="w-96 p-0 border-2 border-gray-300"
              side="top"
              align="center"
            >
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 border-b-2 border-gray-300">
                {getEnchantPrefix(item.itemDisplayName, item.itemName) && (
                  <p className="text-sm text-gray-600 mb-1.5">
                    {getEnchantPrefix(item.itemDisplayName, item.itemName)}
                  </p>
                )}
                <h4 className="font-bold text-gray-900 text-lg mb-2">
                  {getItemNameWithoutAttributes(item.itemName)}
                </h4>
                {getItemAttributes(item.itemName).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {getItemAttributes(item.itemName).map((attr, idx) => (
                      <span key={idx} className="text-xs text-gray-600">
                        #{attr}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="rounded-md bg-blue-100 text-blue-800 border-0">
                    {item.itemTopCategory}
                  </Badge>
                  <span className="text-gray-400">›</span>
                  <Badge className="rounded-md bg-purple-100 text-purple-800 border-0">
                    {item.itemSubCategory}
                  </Badge>
                </div>
              </div>

              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {/* Price Info */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      거래 가격
                    </span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-blue-600">
                        {formatPrice(item.auctionPricePerUnit)}
                      </span>
                      <span className="text-sm text-gray-600 ml-1">골드</span>
                    </div>
                  </div>
                  {item.itemCount > 1 && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-200">
                      <span className="text-xs text-gray-600">수량</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {item.itemCount}개
                      </span>
                    </div>
                  )}
                </div>

                {/* Date Info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">거래일시</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(item.dateAuctionBuy)}
                  </span>
                </div>

                {/* Item Options */}
                {item.itemOptions.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-semibold text-gray-900 text-sm border-b border-gray-200 pb-1">
                      아이템 옵션
                    </h5>
                    <div className="space-y-1.5">
                      {item.itemOptions
                        .filter(
                          (opt) =>
                            !opt.optionType.includes("색상") &&
                            opt.optionType !== "아이템 색상",
                        )
                        .map((option) => (
                          <div
                            key={option.id}
                            className="flex items-start justify-between text-sm bg-gray-50 rounded px-2 py-1.5"
                          >
                            <span className="font-medium text-gray-700 flex-shrink-0">
                              {option.optionType}
                              {option.optionSubType && (
                                <span className="text-gray-500 font-normal ml-1">
                                  ({option.optionSubType})
                                </span>
                              )}
                            </span>
                            <span className="text-gray-900 font-semibold ml-2">
                              {option.optionValue}
                              {option.optionValue2 && ` ~ ${option.optionValue2}`}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Transaction ID */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    거래 ID: {item.auctionBuyId}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          ))}
        </div>
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
          <div className="col-span-5 font-semibold text-gray-900 text-sm">
            아이템 이름
          </div>
          <div className="col-span-2 font-semibold text-gray-900 text-sm text-center">
            카테고리
          </div>
          <div className="col-span-2 font-semibold text-gray-900 text-sm text-right">
            가격
          </div>
          <div className="col-span-2 font-semibold text-gray-900 text-sm text-center">
            거래일시
          </div>
          <div className="col-span-1 font-semibold text-gray-900 text-sm text-center">
            수량
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <Popover key={`${item.auctionBuyId}-${index}`}>
              <PopoverTrigger asChild>
                <div className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-blue-50/50 transition-colors cursor-pointer">
                  {/* Item Name */}
                  <div className="col-span-5 flex items-center">
                    <div className="truncate">
                      <span className="font-medium text-gray-900 text-[0.85rem]">
                        {item.itemDisplayName}
                      </span>
                      {item.itemName !== item.itemDisplayName && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({item.itemName})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="col-span-2 flex items-center justify-center gap-1">
                    <Badge
                      variant="secondary"
                      className="rounded-md bg-blue-50 text-blue-700 border-0 text-xs px-2 py-0.5"
                    >
                      {item.itemSubCategory}
                    </Badge>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 flex items-center justify-end">
                    <span className="font-bold text-blue-600 text-[0.85rem]">
                      {formatPrice(item.auctionPricePerUnit)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">G</span>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 flex items-center justify-center text-sm text-gray-600">
                    {formatDateShort(item.dateAuctionBuy)}
                  </div>

                  {/* Count */}
                  <div className="col-span-1 flex items-center justify-center text-sm text-gray-600">
                    {item.itemCount}
                  </div>
                </div>
            </PopoverTrigger>

            <PopoverContent
              className="w-96 p-0 border-2 border-gray-300"
              side="right"
              align="start"
            >
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 border-b-2 border-gray-300">
                {getEnchantPrefix(item.itemDisplayName, item.itemName) && (
                  <p className="text-sm text-gray-600 mb-1.5">
                    {getEnchantPrefix(item.itemDisplayName, item.itemName)}
                  </p>
                )}
                <h4 className="font-bold text-gray-900 text-lg mb-2">
                  {getItemNameWithoutAttributes(item.itemName)}
                </h4>
                {getItemAttributes(item.itemName).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {getItemAttributes(item.itemName).map((attr, idx) => (
                      <span key={idx} className="text-xs text-gray-600">
                        #{attr}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="rounded-md bg-blue-100 text-blue-800 border-0">
                    {item.itemTopCategory}
                  </Badge>
                  <span className="text-gray-400">›</span>
                  <Badge className="rounded-md bg-purple-100 text-purple-800 border-0">
                    {item.itemSubCategory}
                  </Badge>
                </div>
              </div>

              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {/* Price Info */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      거래 가격
                    </span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-blue-600">
                        {formatPrice(item.auctionPricePerUnit)}
                      </span>
                      <span className="text-sm text-gray-600 ml-1">골드</span>
                    </div>
                  </div>
                  {item.itemCount > 1 && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-200">
                      <span className="text-xs text-gray-600">수량</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {item.itemCount}개
                      </span>
                    </div>
                  )}
                </div>

                {/* Date Info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">거래일시</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(item.dateAuctionBuy)}
                  </span>
                </div>

                {/* Item Options */}
                {item.itemOptions.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-semibold text-gray-900 text-sm border-b border-gray-200 pb-1">
                      아이템 옵션
                    </h5>
                    <div className="space-y-1.5">
                      {item.itemOptions
                        .filter(
                          (opt) =>
                            !opt.optionType.includes("색상") &&
                            opt.optionType !== "아이템 색상",
                        )
                        .map((option) => (
                          <div
                            key={option.id}
                            className="flex items-start justify-between text-sm bg-gray-50 rounded px-2 py-1.5"
                          >
                            <span className="font-medium text-gray-700 flex-shrink-0">
                              {option.optionType}
                              {option.optionSubType && (
                                <span className="text-gray-500 font-normal ml-1">
                                  ({option.optionSubType})
                                </span>
                              )}
                            </span>
                            <span className="text-gray-900 font-semibold ml-2">
                              {option.optionValue}
                              {option.optionValue2 && ` ~ ${option.optionValue2}`}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Transaction ID */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    거래 ID: {item.auctionBuyId}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ))}
        </div>
      </div>
    </>
  );
}
