export const POST_CONTENT_LIMIT = 1000;
const POST_MEDIA_LIMIT = 5;
const POST_VIDEO_LIMIT = 1;
export const POST_MEDIA_SIZE_LIMIT = 5 * 1024 * 1024;

export const ACCEPTED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
] as const;

export function codePointLength(value: string): number {
  return Array.from(value).length;
}

export function sliceCodePoints(value: string, max: number): string {
  return Array.from(value).slice(0, max).join("");
}

export function normalizeExcerpt(value: string, max: number): string {
  return sliceCodePoints(value.replace(/\s+/g, " ").trim(), max);
}

export function derivePostTitle(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  const sentence = normalized.match(/^.*?(?:[.!?。]|$)/)?.[0] ?? normalized;
  return normalizeExcerpt(sentence, 60) || "커뮤니티 게시글";
}

export function validateMediaFiles(files: File[]): string | null {
  if (files.length > POST_MEDIA_LIMIT) {
    return "미디어는 최대 5개까지 첨부할 수 있어요.";
  }
  if (
    files.filter((file) => file.type.startsWith("video/")).length >
    POST_VIDEO_LIMIT
  ) {
    return "영상은 한 개만 첨부할 수 있어요.";
  }
  const unsupported = files.find(
    (file) =>
      !ACCEPTED_MEDIA_TYPES.includes(
        file.type as (typeof ACCEPTED_MEDIA_TYPES)[number],
      ),
  );
  if (unsupported) {
    return "JPEG, PNG, WebP, GIF, MP4, WebM만 첨부할 수 있어요.";
  }
  if (files.some((file) => file.size > POST_MEDIA_SIZE_LIMIT)) {
    return "각 미디어는 5MB 이하여야 해요.";
  }
  return null;
}
