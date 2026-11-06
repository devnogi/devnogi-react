type RankingRowProps = {
  rank: number;
  name: string;
  category: string;
  value: string;
  detail: string;
  accent?: boolean;
};

export default function RankingRow({
  rank,
  name,
  category,
  value,
  detail,
  accent,
}: RankingRowProps) {
  return (
    <li className="grid min-h-10 grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-x-2 border-b border-gray-100 py-1 last:border-0 dark:border-navy-600">
      <span className="text-center text-xs font-medium text-gray-600 dark:text-gray-300">
        {rank}
      </span>
      <div className="min-w-0">
        <p
          title={name}
          className="truncate text-[13px] font-medium leading-4 text-gray-900 dark:text-gray-100"
        >
          {name}
        </p>
        <p className="truncate text-[11px] leading-[14px] text-gray-600 dark:text-gray-300">
          {category}
        </p>
      </div>
      <div className="text-right">
        <p
          className={`text-[13px] font-semibold leading-4 ${accent ? "text-primary" : "text-gray-900 dark:text-gray-100"}`}
        >
          {value}
        </p>
        <p className="text-[11px] leading-[14px] text-gray-600 dark:text-gray-300">
          {detail}
        </p>
      </div>
    </li>
  );
}
