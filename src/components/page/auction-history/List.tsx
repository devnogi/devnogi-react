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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-12 text-center">
        <p className="text-gray-500 text-lg">검색 결과가 없습니다</p>
        <p className="text-gray-400 text-sm mt-2">다른 검색어로 시도해보세요</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-b-2 border-gray-200">
            <TableHead className="w-1/6 font-semibold text-gray-900">날짜</TableHead>
            <TableHead className="w-2/6 font-semibold text-gray-900">상품명</TableHead>
            <TableHead className="w-2/6 font-semibold text-gray-900">가격</TableHead>
            <TableHead className="w-1/6 font-semibold text-gray-900">개수</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auctionHistoryList.map((auctionHistory) => (
            <TableRow
              key={auctionHistory.id}
              tooltipContent={tooltipContent(auctionHistory)}
              className="hover:bg-blue-50/50 transition-colors"
            >
              <TableCell className="w-1/6 text-gray-600">
                {isoStringFormat(auctionHistory.dateAuctionBuy)}
              </TableCell>
              <TableCell className="w-2/6 font-medium text-gray-900">
                {auctionHistory.itemName}
              </TableCell>
              <TableCell className="w-2/6 text-blue-600 font-semibold">
                {auctionHistory.auctionPricePerUnit.toLocaleString()} Gold
              </TableCell>
              <TableCell className="w-1/6 text-gray-600">
                {auctionHistory.itemCount} 개
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
