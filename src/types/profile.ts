export const RACE_OPTIONS = [
  { value: "HUMAN", label: "인간" },
  { value: "GIANT", label: "자이언트" },
  { value: "ELF", label: "엘프" },
  { value: "UNDECIDED", label: "미정" },
] as const;

export const ARCANA_OPTIONS = [
  { value: "ELEMENTAL_KNIGHT", label: "엘레멘탈 나이트" },
  { value: "SAINT_BARD", label: "세인트 바드" },
  { value: "DARK_MAGE", label: "다크 메이지" },
  { value: "ALCHEMIC_STINGER", label: "알케믹 스팅어" },
  { value: "SACRED_GUARD", label: "세이크리드 가드" },
  { value: "BLAST_LANCER", label: "블래스트 랜서" },
  { value: "VARIABLE_GUNNER", label: "배리어블 거너" },
  { value: "FORBIDDEN_ALCHEMIST", label: "포비든 알케미스트" },
  { value: "MELODIC_PUPPETEER", label: "멜로딕 퍼피티어" },
  { value: "FURY_FIGHTER", label: "퓨리 파이터" },
] as const;

export const MBTI_OPTIONS = [
  "ISTJ",
  "ISFJ",
  "INFJ",
  "INTJ",
  "ISTP",
  "ISFP",
  "INFP",
  "INTP",
  "ESTP",
  "ESFP",
  "ENFP",
  "ENTP",
  "ESTJ",
  "ESFJ",
  "ENFJ",
  "ENTJ",
] as const;

type RaceCode = (typeof RACE_OPTIONS)[number]["value"];
type ArcanaCode = (typeof ARCANA_OPTIONS)[number]["value"];
type MbtiCode = (typeof MBTI_OPTIONS)[number];

export interface GameProfile {
  mainChannel: number | null;
  guildName: string | null;
  race: RaceCode | null;
  arcana: ArcanaCode | null;
  preferredColors: string[];
  mbti: MbtiCode | null;
  bio: string | null;
}

export interface PublicUserProfile extends GameProfile {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  serverName: string | null;
  verified: boolean;
  verificationCount: number;
}

interface RgbDraft {
  r: string;
  g: string;
  b: string;
}

export interface GameProfileDraft {
  mainChannel: string;
  guildName: string;
  race: RaceCode | "";
  arcana: ArcanaCode | "";
  colors: [RgbDraft, RgbDraft];
  mbti: MbtiCode | "";
  bio: string;
}

const EMPTY_RGB: RgbDraft = { r: "", g: "", b: "" };

export const EMPTY_GAME_PROFILE_DRAFT: GameProfileDraft = {
  mainChannel: "",
  guildName: "",
  race: "",
  arcana: "",
  colors: [{ ...EMPTY_RGB }, { ...EMPTY_RGB }],
  mbti: "",
  bio: "",
};

const rgbPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

export function rgbToCss(value: string): string | null {
  const match = rgbPattern.exec(value);
  if (!match) return null;
  const channels = match.slice(1).map(Number);
  if (channels.some((channel) => channel < 0 || channel > 255)) return null;
  return `rgb(${channels.join(", ")})`;
}

function rgbToDraft(value?: string): RgbDraft {
  const match = value ? rgbPattern.exec(value) : null;
  return match ? { r: match[1], g: match[2], b: match[3] } : { ...EMPTY_RGB };
}

export function gameProfileToDraft(
  profile?: Partial<GameProfile> | null,
): GameProfileDraft {
  return {
    mainChannel: profile?.mainChannel?.toString() ?? "",
    guildName: profile?.guildName ?? "",
    race: profile?.race ?? "",
    arcana: profile?.arcana ?? "",
    colors: [
      rgbToDraft(profile?.preferredColors?.[0]),
      rgbToDraft(profile?.preferredColors?.[1]),
    ],
    mbti: profile?.mbti ?? "",
    bio: profile?.bio ?? "",
  };
}

function unicodeLength(value: string): number {
  return Array.from(value).length;
}

function normalizeRgb(color: RgbDraft): string | null | undefined {
  const values = [color.r.trim(), color.g.trim(), color.b.trim()];
  if (values.every((value) => value === "")) return null;
  if (values.some((value) => value === "")) return undefined;
  const numbers = values.map(Number);
  if (
    numbers.some(
      (value, index) =>
        !/^\d{1,3}$/.test(values[index]) || value < 0 || value > 255,
    )
  ) {
    return undefined;
  }
  return numbers.join(".");
}

export function validateGameProfileDraft(
  value: GameProfileDraft,
): string | null {
  const mainChannel = value.mainChannel.trim();
  if (
    mainChannel &&
    (!/^\d+$/.test(mainChannel) ||
      Number(mainChannel) < 1 ||
      Number(mainChannel) > 42)
  ) {
    return "주채널은 1에서 42 사이로 입력해주세요.";
  }
  if (unicodeLength(value.guildName.trim()) > 30) {
    return "길드명은 30자 이하로 입력해주세요.";
  }
  if (unicodeLength(value.bio.trim()) > 50) {
    return "자기소개는 50자 이하로 입력해주세요.";
  }
  if (/\p{Cc}|[\r\n]/u.test(`${value.guildName}${value.bio}`)) {
    return "길드명과 자기소개에는 줄바꿈이나 제어문자를 사용할 수 없습니다.";
  }
  if (value.colors.some((color) => normalizeRgb(color) === undefined)) {
    return "지향색의 R, G, B 값은 각각 0에서 255 사이여야 합니다.";
  }
  return null;
}

export function appendGameProfileFormData(
  formData: FormData,
  value: GameProfileDraft,
): void {
  const colors = value.colors
    .map(normalizeRgb)
    .filter((color): color is string => Boolean(color));
  formData.append("mainChannel", value.mainChannel.trim());
  formData.append("guildName", value.guildName.trim());
  formData.append("race", value.race);
  formData.append("arcana", value.arcana);
  formData.append("preferredColor1", colors[0] ?? "");
  formData.append("preferredColor2", colors[1] ?? "");
  formData.append("mbti", value.mbti);
  formData.append("bio", value.bio.trim());
}

export function optionLabel<
  T extends readonly { value: string; label: string }[],
>(options: T, value: string | null): string | null {
  return options.find((option) => option.value === value)?.label ?? null;
}
