import HomeRankingCards from "@/app/(main)/home/HomeRankingCards";

import HomeHeroCarousel from "./HomeHeroCarousel";
import styles from "./HomeLanding.module.css";
export default function HomeLanding() {
  return (
    <div
      className={
        styles.home +
        " visual-polish relative left-1/2 -mt-6 -mb-6 w-[100cqw] -translate-x-1/2 bg-[var(--color-ds-background)] md:-mt-8 md:-mb-8"
      }
    >
      <section className={styles.hero} aria-label="메인 광고">
        <HomeHeroCarousel />
      </section>
      <div role="region" aria-label="홈 콘텐츠" className={styles.content}>
        <HomeRankingCards />
      </div>
    </div>
  );
}
