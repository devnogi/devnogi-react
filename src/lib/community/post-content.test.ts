import {
  codePointLength,
  derivePostTitle,
  normalizeExcerpt,
  POST_MEDIA_SIZE_LIMIT,
  sliceCodePoints,
  validateMediaFiles,
} from "./post-content";

describe("community plain-text content", () => {
  it("counts and truncates Unicode code points rather than UTF-16 units", () => {
    expect(codePointLength("가😀나")).toBe(3);
    expect(sliceCodePoints("가😀나", 2)).toBe("가😀");
  });

  it("derives consistent metadata excerpts from plain text", () => {
    expect(derivePostTitle("  첫 문장입니다. 다음 문장입니다. ")).toBe(
      "첫 문장입니다.",
    );
    expect(normalizeExcerpt("여러\n  공백", 140)).toBe("여러 공백");
  });
});

describe("community media validation", () => {
  const file = (name: string, type: string, size = 1) =>
    new File([new Uint8Array(size)], name, { type });

  it("accepts exactly 5MiB and rejects 5MiB plus one byte", () => {
    expect(
      validateMediaFiles([
        file("ok.webp", "image/webp", POST_MEDIA_SIZE_LIMIT),
      ]),
    ).toBeNull();
    expect(
      validateMediaFiles([
        file("large.webp", "image/webp", POST_MEDIA_SIZE_LIMIT + 1),
      ]),
    ).toContain("5MB");
  });

  it("rejects a sixth item, a second video, and unsupported attachments", () => {
    expect(
      validateMediaFiles(
        Array.from({ length: 6 }, (_, index) =>
          file(`${index}.png`, "image/png"),
        ),
      ),
    ).toContain("최대 5개");
    expect(
      validateMediaFiles([
        file("one.mp4", "video/mp4"),
        file("two.webm", "video/webm"),
      ]),
    ).toContain("한 개");
    expect(
      validateMediaFiles([file("notes.pdf", "application/pdf")]),
    ).toContain("JPEG");
  });
});
