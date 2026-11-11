import Link from "next/link";
import { Fragment } from "react";

import { ACTIVITY_GRADE_LABELS, type ActivityGrade } from "@/types/experience";
import { ARCANA_OPTIONS, type GameProfile } from "@/types/profile";

import CommunityTime from "./CommunityTime";

export default function CommunityAuthorMeta({
  grade,
  verified,
  arcana,
  createdAt,
  href,
}: {
  grade?: ActivityGrade | null;
  verified?: boolean;
  arcana?: GameProfile["arcana"];
  createdAt?: string;
  href?: string;
}) {
  const gradeLabel =
    verified && grade ? ACTIVITY_GRADE_LABELS[grade] : undefined;
  const arcanaLabel = ARCANA_OPTIONS.find(
    (option) => option.value === arcana,
  )?.label;
  const time = createdAt ? <CommunityTime value={createdAt} /> : null;
  const items = [
    gradeLabel ? (
      <span key="grade" aria-label={`활동 등급: ${gradeLabel}`}>
        {gradeLabel}
      </span>
    ) : null,
    arcanaLabel ? <span key="arcana">{arcanaLabel}</span> : null,
    time ? (
      href ? (
        <Link key="time" href={href} className="hover:underline">
          {time}
        </Link>
      ) : (
        <span key="time">{time}</span>
      )
    ) : null,
  ].filter((item) => item !== null);
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-1 text-xs font-normal leading-[18px] text-muted-foreground">
      {items.map((item, index) => (
        <Fragment key={item.key}>
          {index > 0 && <span aria-hidden="true">·</span>}
          {item}
        </Fragment>
      ))}
    </div>
  );
}
