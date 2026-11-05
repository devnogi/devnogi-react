import { BadgeCheck } from "lucide-react";
import Image from "next/image";

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
    <header className="border-b border-gray-200 pb-8 dark:border-navy-600 md:grid md:grid-cols-[15rem_minmax(0,1fr)] md:gap-12 md:pb-10">
      <div className="mb-6 flex justify-center md:mb-0 md:justify-start">
        <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-[#f4eee6] text-5xl font-semibold text-[#8d3f25] dark:border-navy-500 dark:bg-navy-700 dark:text-[#e3aa73] md:h-52 md:w-52">
          {profile.profileImageUrl ? (
            <Image
              src={profile.profileImageUrl}
              alt={`${profile.nickname} 프로필 사진`}
              fill
              sizes="(min-width: 768px) 208px, 144px"
              className="object-cover"
              unoptimized
              priority
            />
          ) : (
            <span aria-hidden="true">{initial}</span>
          )}
        </div>
      </div>

      <div className="min-w-0 self-center text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 md:justify-start">
          <h1 className="break-words text-3xl font-bold tracking-tight text-gray-950 dark:text-white md:text-4xl">
            {profile.nickname}
          </h1>
          {profile.verified ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-[#9a451f] dark:text-[#e3aa73]">
              <BadgeCheck className="h-5 w-5" aria-hidden="true" />
              인게임 인증 · {profile.verificationCount.toLocaleString()}회
            </span>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              인게임 미인증 · 인증 {profile.verificationCount.toLocaleString()}
              회
            </span>
          )}
        </div>
        {profile.serverName ? (
          <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            {profile.serverName} 서버
          </p>
        ) : null}
        {profile.bio ? (
          <p className="mx-auto mt-5 max-w-2xl break-words text-base leading-7 text-gray-700 dark:text-gray-200 md:mx-0">
            {profile.bio}
          </p>
        ) : null}

        {details.length > 0 || profile.preferredColors.length > 0 ? (
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-gray-200 pt-5 text-left dark:border-navy-600 sm:grid-cols-3">
            {details.map((detail) => (
              <div key={detail.label}>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {detail.label}
                </dt>
                <dd className="mt-1 break-words text-sm font-semibold text-gray-900 dark:text-white">
                  {detail.value}
                </dd>
              </div>
            ))}
            {profile.preferredColors.length > 0 ? (
              <div>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
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
      </div>
    </header>
  );
}
