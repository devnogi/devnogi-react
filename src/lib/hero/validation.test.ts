import fixtures from "../../../docs/hero-link-fixtures.json";
import {
  fromKoreanInput,
  toKoreanInput,
  validateHeroImage,
  validateHeroLink,
} from "./validation";

it.each(fixtures)("link valid=$valid: $url", ({ url, valid }) => {
  if (valid) expect(validateHeroLink(url)).toBe(url || null);
  else expect(() => validateHeroLink(url)).toThrow();
});

it("uses Korean time regardless of browser timezone, with optional seconds", () => {
  expect(fromKoreanInput("2026-11-15T22:00")).toBe("2026-11-15T13:00:00.000Z");
  expect(fromKoreanInput("2026-11-15T22:00:30")).toBe(
    "2026-11-15T13:00:30.000Z",
  );
  expect(toKoreanInput("2026-11-15T13:00:00Z")).toBe("2026-11-15T22:00");
});

it("rejects empty, oversized, and unsupported images before decoding", async () => {
  await expect(
    validateHeroImage(new File([], "x.png", { type: "image/png" })),
  ).rejects.toThrow();
  await expect(
    validateHeroImage(
      new File([new Uint8Array(10 * 1024 * 1024 + 1)], "x.png", {
        type: "image/png",
      }),
    ),
  ).rejects.toThrow();
  await expect(
    validateHeroImage(new File(["<svg/>"], "x.svg", { type: "image/svg+xml" })),
  ).rejects.toThrow();
});
