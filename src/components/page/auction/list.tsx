export type AuctionItem = {
  id: number;
  name: string;
  timeLeft: string;
  tradeType: string;
  pricePerUnit: string;
  totalPrice: string;
};

const ListHeader = () => (
  <div className="flex">
    <div className="flex-[4] border border-gray-600 rounded-xs text-center">
      아이템
    </div>
    <div className="flex-[1] border border-gray-600 rounded-xs text-center">
      남은 시간
    </div>
    <div className="flex-[1] border border-gray-600 rounded-xs text-center">
      거래 방식
    </div>
    <div className="flex-[3] border border-gray-600 rounded-xs text-center">
      가격
    </div>
  </div>
);

const ListItem = ({ item }: { item: AuctionItem }) => (
  <div className="flex items-stretch border border-black p-1 rounded-sm hover:bg-gray-100">
    <div className="flex-[4] border rounded-xs shadow-sm shadow-bottom flex items-center justify-center">
      {item.name}
    </div>
    <div className="flex-[1] border rounded-xs shadow-sm shadow-bottom flex items-center justify-center">
      {item.timeLeft}
    </div>
    <div className="flex-[1] border rounded-xs shadow-sm shadow-bottom flex items-center justify-center">
      {item.tradeType}
    </div>
    <div className="flex-[3] border rounded-xs shadow-sm shadow-bottom flex flex-col items-center justify-center">
      <div>개당 : {item.pricePerUnit}</div>
      <div>전체 : {item.totalPrice}</div>
    </div>
  </div>
);

export default function AuctionList({ items }: { items: AuctionItem[] }) {
  return (
    <div className="flex-1 flex flex-col">
      <ListHeader />
      <div className="space-y-[1px] mt-1 p-1 rounded-xs shadow-sm overflow-y-auto">
        {items.map((item) => (
          <ListItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
