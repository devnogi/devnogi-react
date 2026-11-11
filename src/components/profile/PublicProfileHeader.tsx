import { BadgeCheck } from "lucide-react";
import Image from "next/image";

import ActivityGradeBadge from "@/components/ui/ActivityGradeBadge";
import type { PublicUserProfile } from "@/types/profile";
import {
  ARCANA_OPTIONS,
  optionLabel,
  RACE_OPTIONS,
  rgbToCss,
} from "@/types/profile";

export default function PublicProfileHeader({
  profile,
}: {
  profile: PublicUserProfile;
}) {
  const details = [
    profile.mainChannel
      ? { label: "주채널", value: `${profile.mainChannel}채널` }
      : null,
    profile.guildName ? { label: "길드", value: profile.guildName } : null,
    profile.race
      ? { label: "종족", value: optionLabel(RACE_OPTIONS, profile.race) }
      : null,
    profile.arcana
      ? {
          label: "아르카나",
          value: optionLabel(ARCANA_OPTIONS, profile.arcana),
        }
      : null,
    profile.mbti ? { label: "MBTI", value: profile.mbti } : null,
  ].filter((detail): detail is { label: string; value: string } =>
    Boolean(detail?.value),
  );
  const initial = profile.nickname.slice(0, 1).toUpperCase();

  return (
    <header className="grid grid-cols-[80px_minmax(0,1fr)] gap-4 border-b border-gray-200 pb-6 dark:border-navy-600 md:grid-cols-[112px_minmax(0,1fr)] md:gap-6">
      <div>
        <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-[var(--color-ds-primary-50)] text-3xl font-semibold text-[var(--color-ds-primary)] dark:border-navy-500 md:h-28 md:w-28">
          {profile.profileImageUrl ? (
            <Image
              src={profile.profileImageUrl}
              alt={`${profile.nickname} 프로필 사진`}
              fill
              sizes="(min-width: 768px) 112px, 80px"
              className="object-cover"
              unoptimized
              priority
            />
          ) : (
            <span aria-hidden="true">{initial}</span>
          )}
        </div>
      </div>

      <div className="min-w-0 self-center">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="min-w-0 break-words text-2xl font-bold tracking-tight text-gray-950 dark:text-white md:text-[28px]">
            {profile.nickname}
          </h1>
          <ActivityGradeBadge
            grade={profile.activityGrade}
            verified={profile.verified}
          />
          {profile.verified ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-ds-primary)]">
              <BadgeCheck className="h-5 w-5" aria-hidden="true" />
              인게임 인증
              {profile.verificationCount > 0
                ? ` · ${profile.verificationCount.toLocaleString()}회`
                : ""}
            </span>
          ) : (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              인게임 미인증
              {profile.verificationCount > 0
                ? ` · 인증 ${profile.verificationCount.toLocaleString()}회`
                : ""}
            </span>
          )}
        </div>
        {profile.serverName ? (
          <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            {profile.serverName} 서버
          </p>
        ) : null}
      </div>
      {profile.bio ? (
        <p className="col-span-2 min-w-0 break-words text-base leading-7 text-gray-700 dark:text-gray-200">
          {profile.bio}
        </p>
      ) : null}

      {details.length > 0 || profile.preferredColors.length > 0 ? (
        <dl className="col-span-2 grid min-w-0 grid-cols-2 gap-x-6 gap-y-4 text-left sm:grid-cols-3">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {detail.label}
              </dt>
              <dd className="mt-1 break-words text-sm font-semibold text-gray-900 dark:text-white">
                {detail.value}
              </dd>
            </div>
          ))}
          {profile.preferredColors.length > 0 ? (
            <div>
              <dt className="text-xs font-medium text-gray-600 dark:text-gray-400">
                지향색
              </dt>
              <dd className="mt-1 flex items-center gap-2">
                {profile.preferredColors.map((color) => (
                  <span
                    key={color}
                    title={color}
                    aria-label={`RGB ${color}`}
                    className="h-5 w-5 rounded-md border border-gray-300 dark:border-navy-400"
                    style={{ backgroundColor: rgbToCss(color) ?? undefined }}
                  />
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </header>
  );
}
