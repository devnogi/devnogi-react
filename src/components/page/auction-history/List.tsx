import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { isoStringFormat } from "@/utils/date";

export type AuctionHistory = {
  id: number;
  dateAuctionBuy: string;
  itemName: string;
  auctionPricePerUnit: number;
  itemCount: string;
};

export default function AuctionHistoryList({
  auctionHistoryList,
}: {
  auctionHistoryList: AuctionHistory[];
}) {
  const tooltipContent = (history: AuctionHistory) => {
    return `날짜: ${isoStringFormat(history.dateAuctionBuy)}\n상품명: ${history.itemName}\n가격: ${history.auctionPricePerUnit.toLocaleString()} Gold\n개수: ${history.itemCount} 개`;
  };

  if (auctionHistoryList.length === 0) {
    return (
      <div className="bg-white dark:bg-navy-700 rounded-2xl border border-gray-200 dark:border-navy-600 shadow-lg p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">검색 결과가 없습니다</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">다른 검색어로 시도해보세요</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-navy-700 rounded-2xl border border-gray-200 dark:border-navy-600 shadow-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-navy-800 border-b-2 border-gray-200 dark:border-navy-600">
            <TableHead className="w-1/6 font-semibold text-gray-900 dark:text-white">날짜</TableHead>
            <TableHead className="w-2/6 font-semibold text-gray-900 dark:text-white">상품명</TableHead>
            <TableHead className="w-2/6 font-semibold text-gray-900 dark:text-white">가격</TableHead>
            <TableHead className="w-1/6 font-semibold text-gray-900 dark:text-white">개수</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auctionHistoryList.map((auctionHistory) => (
            <TableRow
              key={auctionHistory.id}
              tooltipContent={tooltipContent(auctionHistory)}
              className="hover:bg-blue-50/50 dark:hover:bg-navy-600/50 transition-colors"
            >
              <TableCell className="w-1/6 text-gray-600 dark:text-gray-400">
                {isoStringFormat(auctionHistory.dateAuctionBuy)}
              </TableCell>
              <TableCell className="w-2/6 font-medium text-gray-900 dark:text-white">
                {auctionHistory.itemName}
              </TableCell>
              <TableCell className="w-2/6 text-blue-600 dark:text-coral-400 font-semibold">
                {auctionHistory.auctionPricePerUnit.toLocaleString()} Gold
              </TableCell>
              <TableCell className="w-1/6 text-gray-600 dark:text-gray-400">
                {auctionHistory.itemCount} 개
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
