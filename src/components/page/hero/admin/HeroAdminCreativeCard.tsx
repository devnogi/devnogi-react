import { heroTime } from "@/lib/hero/validation";
import type { AdminHeroCreative } from "@/types/hero";

import HeroAdminImage from "./HeroAdminImage";
import HeroAdminLink from "./HeroAdminLink";
import HeroModeration from "./HeroModeration";

export default function HeroAdminCreativeCard({
  creative,
  onChanged,
}: {
  creative: AdminHeroCreative;
  onChanged: () => Promise<unknown>;
}) {
  return (
    <article
      className="min-w-0 space-y-3 rounded-lg border p-4"
      aria-label={`광고 이미지 ${creative.id}: ${creative.altText}`}
    >
      <HeroAdminImage imageUrl={creative.imageUrl} altText={creative.altText} />
      <h3 className="break-words font-semibold">
        #{creative.id} {creative.altText}
      </h3>
      <p className="text-sm">
        등록자 {creative.nickname || "닉네임 없음"} · 회원 #{creative.userId}
      </p>
      <p className="text-sm text-muted-foreground">
        등록 {heroTime(creative.createdAt)}
      </p>
      <HeroAdminLink value={creative.linkUrl} />
      <p
        className={`text-sm font-medium ${creative.blocked ? "text-red-700 dark:text-red-300" : ""}`}
      >
        {creative.blocked ? "차단된 소재" : "사용 가능"}
      </p>
      {creative.blocked && creative.blockReason ? (
        <p className="break-words text-sm">차단 사유: {creative.blockReason}</p>
      ) : null}
      <ul
        aria-label="이미지 사용 현황"
        className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground"
      >
        <li>진행 중 입찰 {creative.leadingBidCount}건</li>
        <li>노출 예정 {creative.scheduledPlacementCount}건</li>
        <li>노출 중 {creative.activePlacementCount}건</li>
      </ul>
      <HeroModeration
        key={creative.blocked ? "blocked" : "available"}
        id={creative.id}
        action={creative.blocked ? "unblock" : "block"}
        onChanged={onChanged}
      />
    </article>
  );
}
