import type { ItemInfoResponse } from "@/types/item-info";

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
        {value}
      </dd>
    </div>
  );
}

export default function ItemMetadata({ info }: { info: ItemInfoResponse }) {
  return (
    <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
      <DetailField label="설명" value={info.description} />
      <DetailField
        label="인벤토리 크기"
        value={
          info.inventoryWidth && info.inventoryHeight
            ? `${info.inventoryWidth} × ${info.inventoryHeight}`
            : null
        }
      />
      <DetailField label="최대 번들" value={info.inventoryMaxBundleCount} />
      <DetailField label="입수 방법" value={info.acquisitionMethod} />
      <DetailField label="상점 판매가" value={info.storeSalesPrice} />
      <DetailField label="무기 타입" value={info.weaponType} />
      <DetailField label="수리" value={info.repair} />
      <DetailField label="최대 개조 횟수" value={info.maxAlterationCount} />
      <DetailField label="아이템 역사" value={info.history} />
    </dl>
  );
}
