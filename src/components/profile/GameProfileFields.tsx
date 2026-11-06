"use client";

import type { GameProfileDraft } from "@/types/profile";
import {
  ARCANA_OPTIONS,
  MBTI_OPTIONS,
  RACE_OPTIONS,
  rgbToCss,
} from "@/types/profile";

interface GameProfileFieldsProps {
  value: GameProfileDraft;
  onChange: (value: GameProfileDraft) => void;
  disabled?: boolean;
  idPrefix: string;
}

const fieldClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:bg-gray-100 dark:border-navy-500 dark:bg-navy-700 dark:text-white";

function limitCodePoints(value: string, maximum: number): string {
  return Array.from(value).slice(0, maximum).join("");
}

export default function GameProfileFields({
  value,
  onChange,
  disabled = false,
  idPrefix,
}: GameProfileFieldsProps) {
  const update = <K extends keyof GameProfileDraft>(
    key: K,
    nextValue: GameProfileDraft[K],
  ) => onChange({ ...value, [key]: nextValue });

  const updateColor = (
    index: 0 | 1,
    channel: "r" | "g" | "b",
    nextValue: string,
  ) => {
    if (nextValue !== "" && !/^\d{0,3}$/.test(nextValue)) return;
    const colors: GameProfileDraft["colors"] = [
      { ...value.colors[0] },
      { ...value.colors[1] },
    ];
    colors[index][channel] = nextValue;
    update("colors", colors);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          <span>주채널</span>
          <select
            id={`${idPrefix}-channel`}
            className={fieldClass}
            value={value.mainChannel}
            onChange={(event) => update("mainChannel", event.target.value)}
            disabled={disabled}
          >
            <option value="">선택 안 함</option>
            {Array.from({ length: 42 }, (_, index) => index + 1).map(
              (channel) => (
                <option key={channel} value={channel}>
                  {channel}채널
                </option>
              ),
            )}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          <span>길드</span>
          <input
            id={`${idPrefix}-guild`}
            className={fieldClass}
            value={value.guildName}
            onChange={(event) =>
              update("guildName", limitCodePoints(event.target.value, 30))
            }
            placeholder="길드명"
            disabled={disabled}
          />
          <span className="block text-right text-xs font-normal text-gray-500 dark:text-gray-400">
            {Array.from(value.guildName).length}/30
          </span>
        </label>
        <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          <span>종족</span>
          <select
            id={`${idPrefix}-race`}
            className={fieldClass}
            value={value.race}
            onChange={(event) =>
              update("race", event.target.value as GameProfileDraft["race"])
            }
            disabled={disabled}
          >
            <option value="">선택 안 함</option>
            {RACE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          <span>아르카나</span>
          <select
            id={`${idPrefix}-arcana`}
            className={fieldClass}
            value={value.arcana}
            onChange={(event) =>
              update("arcana", event.target.value as GameProfileDraft["arcana"])
            }
            disabled={disabled}
          >
            <option value="">선택 안 함</option>
            {ARCANA_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          <span>MBTI</span>
          <select
            id={`${idPrefix}-mbti`}
            className={fieldClass}
            value={value.mbti}
            onChange={(event) =>
              update("mbti", event.target.value as GameProfileDraft["mbti"])
            }
            disabled={disabled}
          >
            <option value="">선택 안 함</option>
            {MBTI_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-gray-700 dark:text-gray-200">
          지향색
        </legend>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          RGB 값을 0에서 255 사이로 입력하세요.
        </p>
        {value.colors.map((color, index) => {
          const colorValue = [color.r, color.g, color.b].join(".");
          const preview = rgbToCss(colorValue);
          return (
            <div key={index} className="flex items-center gap-3">
              <span
                aria-label={`${index + 1}번째 지향색 미리보기`}
                className="h-9 w-9 shrink-0 rounded-lg border border-gray-300 bg-gray-100"
                style={preview ? { backgroundColor: preview } : undefined}
              />
              {(["r", "g", "b"] as const).map((channel) => (
                <label key={channel} className="min-w-0 flex-1">
                  <span className="sr-only">
                    {index + 1}번째 지향색 {channel.toUpperCase()}
                  </span>
                  <input
                    inputMode="numeric"
                    className={`${fieldClass} text-center tabular-nums`}
                    value={color[channel]}
                    onChange={(event) =>
                      updateColor(index as 0 | 1, channel, event.target.value)
                    }
                    placeholder={channel.toUpperCase()}
                    disabled={disabled}
                  />
                </label>
              ))}
            </div>
          );
        })}
      </fieldset>

      <label className="block space-y-2 text-sm font-medium text-gray-700 dark:text-gray-200">
        <span>자기소개</span>
        <textarea
          id={`${idPrefix}-bio`}
          className="min-h-24 w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:bg-gray-100 dark:border-navy-500 dark:bg-navy-700 dark:text-white"
          value={value.bio}
          onChange={(event) =>
            update("bio", limitCodePoints(event.target.value, 50))
          }
          placeholder="에린에서의 나를 소개해주세요"
          disabled={disabled}
        />
        <span className="block text-right text-xs font-normal text-gray-500 dark:text-gray-400">
          {Array.from(value.bio).length}/50
        </span>
      </label>
    </div>
  );
}
