import type { GameProfileDraft } from "./profile";
import {
  appendGameProfileFormData,
  EMPTY_GAME_PROFILE_DRAFT,
  validateGameProfileDraft,
} from "./profile";

it("지향색 경계값과 Unicode 문자열을 허용한다", () => {
  const value: GameProfileDraft = {
    ...EMPTY_GAME_PROFILE_DRAFT,
    guildName: "길드🌿",
    colors: [
      { r: "0", g: "255", b: "0" },
      { r: "255", g: "0", b: "255" },
    ],
  };
  expect(validateGameProfileDraft(value)).toBeNull();
  const form = new FormData();
  appendGameProfileFormData(form, value);
  expect(form.get("preferredColor1")).toBe("0.255.0");
  expect(form.get("preferredColor2")).toBe("255.0.255");
});

it.each<[GameProfileDraft, string]>([
  [{ ...EMPTY_GAME_PROFILE_DRAFT, mainChannel: "0" }, "1에서 42"],
  [{ ...EMPTY_GAME_PROFILE_DRAFT, mainChannel: "43" }, "1에서 42"],
  [
    {
      ...EMPTY_GAME_PROFILE_DRAFT,
      colors: [
        { r: "256", g: "0", b: "0" },
        { r: "", g: "", b: "" },
      ],
    },
    "0에서 255",
  ],
  [{ ...EMPTY_GAME_PROFILE_DRAFT, bio: "줄바꿈\n금지" }, "제어문자"],
])("잘못된 게임 프로필을 거부한다", (value, message) => {
  expect(validateGameProfileDraft(value)).toContain(message);
});
