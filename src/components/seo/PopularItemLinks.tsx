import Link from "next/link";

import { getItemSeo, getPopularItems } from "@/lib/items/data";
import { encodeItemKey, itemPath } from "@/lib/items/identity";

export default async function PopularItemLinks() {
  let data;
  try {
    const rankings = await getPopularItems();
    const catalog = await Promise.all(
      rankings.slice(0, 3).map((item) =>
        getItemSeo(
          encodeItemKey({
            name: item.itemName,
            topCategory: item.itemTopCategory,
            subCategory: item.itemSubCategory,
          }),
          300,
        ),
      ),
    );
    data = catalog.flatMap((result) => (result ? [result.item] : []));
  } catch (error) {
    console.error("[PopularItemLinks] Public item summary unavailable", error);
    return (
      <p className="mt-3 text-sm text-white">
        인기 아이템 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.
      </p>
    );
  }
  if (!data.length) return null;

  return (
    <nav
      aria-label="오늘 많이 거래된 아이템"
      className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-white [text-shadow:0_1px_3px_#000]"
    >
      <span className="text-xs font-medium text-stone-200">
        오늘 많이 거래된 아이템
      </span>
      {data.map((item) => (
        <Link
          key={itemPath(item)}
          href={itemPath(item)}
          className="max-w-full truncate py-1 font-medium underline-offset-4 hover:underline focus-visible:outline-2"
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
