"use client";

import { UserVerificationInfoResponse } from "@/types/verification";
import { BadgeCheck, AlertCircle, Server, Gamepad2, Calendar, Hash } from "lucide-react";
import clsx from "clsx";

interface VerificationStatusCardProps {
  info: UserVerificationInfoResponse | null | undefined;
  isLoading: boolean;
}

export default function VerificationStatusCard({
  info,
  isLoading,
}: VerificationStatusCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-200 dark:border-navy-600 p-5 sm:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-navy-600 rounded w-1/3" />
          <div className="h-4 bg-gray-200 dark:bg-navy-600 rounded w-2/3" />
          <div className="h-4 bg-gray-200 dark:bg-navy-600 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!info) return null;

  const isVerified = info.verified;

  return (
    <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-200 dark:border-navy-600 p-5 sm:p-8">
      <div className="flex items-center gap-3 mb-5">
        <div
          className={clsx(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            isVerified
              ? "bg-green-50 dark:bg-green-900/20"
              : "bg-amber-50 dark:bg-amber-900/20"
          )}
        >
          {isVerified ? (
            <BadgeCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            인증 상태
          </h3>
          <span
            className={clsx(
              "inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mt-0.5",
              isVerified
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
            )}
          >
            {isVerified ? "인증 완료" : "미인증"}
          </span>
        </div>
      </div>

      {isVerified ? (
        <div className="space-y-3">
          <InfoRow
            icon={<Server className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
            label="서버"
            value={info.serverName ?? "-"}
          />
          <InfoRow
            icon={<Gamepad2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
            label="캐릭터"
            value={info.characterName ?? "-"}
          />
          <InfoRow
            icon={<Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
            label="마지막 인증일"
            value={info.lastVerifiedAt ? formatDate(info.lastVerifiedAt) : "-"}
          />
          <InfoRow
            icon={<Hash className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
            label="인증 횟수"
            value={`${info.verificationCount}회`}
          />
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-4">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            아직 캐릭터 인증이 완료되지 않았습니다. 아래에서 인증을 시작해주세요.
          </p>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-navy-600 last:border-0">
      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-navy-700 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-base font-medium text-gray-900 dark:text-gray-100">
          {value}
        </p>
      </div>
    </div>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
