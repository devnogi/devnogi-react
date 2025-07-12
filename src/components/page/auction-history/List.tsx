import {
  List,
  ListHeader,
  ListHeaderCell,
  ListBody,
  ListRow,
  ListCell,
} from "@/components/ui/list";
import { isoStringFormat } from "@/utils/date";

export type TradeLog = {
  id: number;
  dateAuctionBuy: string;
  itemName: string;
  auctionPricePerUnit: number;
  itemCount: string;
};

export default function TradeLogList({ logs }: { logs: TradeLog[] }) {
  return (
    <List>
      <ListHeader>
        <ListHeaderCell className="flex-[3]">판매일시</ListHeaderCell>
        <ListHeaderCell className="flex-[5]">상품명</ListHeaderCell>
        <ListHeaderCell className="flex-[3]">가격</ListHeaderCell>
        <ListHeaderCell className="flex-[1]">수량</ListHeaderCell>
      </ListHeader>
      <ListBody>
        {logs.map((trade) => (
          <ListRow key={trade.id}>
            <ListCell className="flex-[3]">
              {isoStringFormat(trade.dateAuctionBuy, "yyyy-MM-dd HH:mm")}
            </ListCell>
            <ListCell className="flex-[5]">{trade.itemName}</ListCell>
            <ListCell className="flex-[3]">
              {trade.auctionPricePerUnit.toLocaleString()} Gold
            </ListCell>
            <ListCell className="flex-[1]">{trade.itemCount} 개</ListCell>
          </ListRow>
        ))}
      </ListBody>
    </List>
  );
}
