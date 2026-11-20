"use client";

import { useState } from "react";

import { heroRequest } from "@/lib/hero/request";

import HeroAdminConfirm from "./HeroAdminConfirm";

const actions = {
  block: {
    reasonLabel: "소재 차단 사유",
    label: "소재 차단·광고 중단 (환불 없음)",
    title: "이 광고 이미지를 차단할까요?",
    description:
      "진행 중 입찰과 예정·노출 광고가 중단됩니다. 이미 지불한 XP는 환불하지 않습니다.",
  },
  unblock: {
    reasonLabel: "소재 차단 해제 사유",
    label: "소재 차단 해제",
    title: "이 광고 이미지의 차단을 해제할까요?",
    description:
      "새 입찰에 다시 사용할 수 있습니다. 이미 중단된 입찰·광고는 복구되지 않으며 XP도 변경되지 않습니다.",
  },
  cancel: {
    reasonLabel: "해당 주차 전체 취소 사유",
    label: "이 주차 두 경매 취소·전액 환불",
    title: "이 주차의 두 경매를 모두 취소할까요?",
    description:
      "해당 주차의 1·2번 광고를 모두 중단하고, 지불한 XP를 전액 환불합니다. 취소한 경매는 복구되지 않습니다.",
  },
} as const;

export default function HeroModeration({
  id,
  action,
  onChanged,
}: {
  id: number;
  action: keyof typeof actions;
  onChanged: () => Promise<unknown>;
}) {
  const [reason, setReason] = useState("");
  const copy = actions[action];
  return (
    <div className="space-y-3">
      <label className="block text-sm">
        {copy.reasonLabel}
        <input
          required
          maxLength={500}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="mt-1 block min-h-11 w-full rounded-md border border-input bg-background p-2"
        />
      </label>
      <HeroAdminConfirm
        label={copy.label}
        title={copy.title}
        description={`${copy.description}\n사유: ${reason.trim()}`}
        disabled={!reason.trim()}
        destructive={action !== "unblock"}
        onConfirm={async () => {
          await heroRequest(
            action === "cancel"
              ? `admin/hero/auctions/${id}/cancel`
              : `admin/hero/creatives/${id}/${action}`,
            "POST",
            { reason: reason.trim() },
          );
          await onChanged();
          setReason("");
        }}
      />
    </div>
  );
}
