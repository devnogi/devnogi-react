import styles from "./HomeCards.module.css";
type RankingRowProps = {
  rank: number;
  name: string;
  category: string;
  value: string;
  detail: string;
  featured?: boolean;
};
export default function RankingRow({
  rank,
  name,
  category,
  value,
  detail,
  featured,
}: RankingRowProps) {
  return (
    <li className={styles.row}>
      <span className={styles.rank}>{rank}</span>
      <div className="min-w-0">
        <p title={name} className={styles.name}>
          {name}
        </p>
        <p className={styles.meta}>{category}</p>
      </div>
      <div className={styles.values}>
        <p className={`${styles.value} ${featured ? styles.featured : ""}`}>
          {value}
        </p>
        <p className={styles.meta}>{detail}</p>
      </div>
    </li>
  );
}
