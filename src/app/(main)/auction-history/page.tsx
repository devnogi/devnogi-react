"use client";

import CategoryLayout from "@/components/commons/FilterableListLayout";
import TradeLogList from "@/components/page/auction-history/List";
import { clientAxios } from "@/lib/api/clients";
import { AUCTION_HISTORY_ENDPOINT } from "@/lib/api/constants";
import { useEffect, useState } from "react";

export default function Page() {
  const [itemCategory, setItemCategory] = useState<string>("all");
  const [itemName, setItemName] = useState<string>("");
  const [tradeLogs, setTradeLogs] = useState([]);

  const getTradeLogList = async () => {
    const response = await clientAxios(AUCTION_HISTORY_ENDPOINT, {
      params: {
        itemName: itemName,
        category: itemCategory,
      },
    });

    return response;
  };

  useEffect(() => {
    getTradeLogList().then((res) => {
      setTradeLogs(res.data);
    });
  }, [itemCategory, itemName]);

  return (
    <CategoryLayout
      selectedCategory={itemCategory}
      setSelectedCategory={setItemCategory}
      itemName={itemName}
      setItemName={setItemName}
      categoryStorageKey="lastSelectedCategoryTradeLog"
    >
      <TradeLogList logs={tradeLogs} />
    </CategoryLayout>
  );
}
