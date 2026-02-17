"use client";

import { useState } from "react";
import { ChevronDown, KeyRound, Monitor, FileEdit, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

const steps = [
  {
    icon: KeyRound,
    title: "인증 코드 발급",
    description: "위의 '인증 시작' 버튼을 클릭하여 인증 코드를 발급받으세요.",
  },
  {
    icon: Monitor,
    title: "마비노기 게임 접속",
    description: "마비노기 게임에 접속하여 인증할 캐릭터로 로그인하세요.",
  },
  {
    icon: FileEdit,
    title: "캐릭터 메모에 코드 입력",
    description:
      "캐릭터 메모장을 열고, 발급받은 인증 코드를 그대로 입력한 뒤 저장하세요.",
  },
  {
    icon: CheckCircle2,
    title: "자동 인증 완료",
    description:
      "시스템이 자동으로 캐릭터 메모를 확인하여 인증을 완료합니다. 잠시만 기다려주세요.",
  },
];

export default function VerificationInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-200 dark:border-navy-600">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 sm:p-8 text-left"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          인증 방법 안내
        </h3>
        <ChevronDown
          className={clsx(
            "w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="px-5 sm:px-8 pb-5 sm:pb-8 -mt-2">
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-px h-full bg-gray-200 dark:bg-navy-600 mt-2" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {index + 1}. {step.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
