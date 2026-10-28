"use client";

import { CircleHelp } from "lucide-react";
import { useId, useState } from "react";

export function NicknamePolicyHelp({ legacy = false }: { legacy?: boolean }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        aria-label="닉네임 정책 도움말"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex rounded-full text-gray-500 hover:text-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        <CircleHelp aria-hidden="true" className="h-4 w-4" />
      </button>
      <span
        id={id}
        role="note"
        hidden={!open}
        className="text-xs font-normal text-gray-600"
      >
        {legacy && "기존 닉네임은 변경 전까지 유지됩니다. "}
        인게임 인증 전에는 자동 생성된 닉네임만 사용할 수 있습니다. 인게임 인증
        후 해당 캐릭터 이름이 적용됩니다.
      </span>
    </span>
  );
}
