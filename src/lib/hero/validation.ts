export function validateHeroLink(value: string): string | null {
  if (!value) return null;
  if (
    value.length > 2048 ||
    /\s|\\|[\u0000-\u001f\u007f]/.test(value) ||
    /%(?![a-f0-9]{2})/i.test(value)
  )
    throw new Error(
      "링크에 공백, 제어 문자 또는 역슬래시를 사용할 수 없습니다.",
    );
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("https://로 시작하는 전체 링크를 입력해주세요.");
  }
  const label = "[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?";
  const authority = /^https:\/\/([^/?#]*)/i.exec(value)?.[1] ?? "";
  if (
    !/^https:\/\//i.test(value) ||
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443") ||
    url.hostname.length > 253 ||
    !new RegExp(`^(?:${label}\\.)+memonogi\\.com$`, "i").test(url.hostname) ||
    !new RegExp(`^(?:${label}\\.)+memonogi\\.com(?::443)?$`, "i").test(
      authority,
    )
  )
    throw new Error("https://*.memonogi.com 링크만 사용할 수 있습니다.");
  return value;
}

export async function validateHeroImage(file: File): Promise<void> {
  if (!file.size || file.size > 10 * 1024 * 1024)
    throw new Error("이미지는 10 MiB 이하로 등록해주세요.");
  if (!["image/jpeg", "image/png"].includes(file.type))
    throw new Error("JPEG 또는 PNG 이미지만 등록할 수 있습니다.");
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b);
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (
    (file.type === "image/png" && !png) ||
    (file.type === "image/jpeg" && !jpeg)
  )
    throw new Error("이미지의 실제 형식을 확인해주세요.");
  const url = URL.createObjectURL(file);
  try {
    await new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        if (
          !image.naturalWidth ||
          !image.naturalHeight ||
          image.naturalWidth * image.naturalHeight > 24_000_000
        )
          reject(new Error("이미지는 2,400만 화소 이하로 등록해주세요."));
        else resolve();
      };
      image.onerror = () => reject(new Error("이미지를 읽을 수 없습니다."));
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function heroTime(value: string | null): string {
  return value
    ? new Date(value).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })
    : "제한 없음";
}

export function toKoreanInput(value: string | null): string {
  return value
    ? new Date(Date.parse(value) + 9 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16)
    : "";
}

export function fromKoreanInput(value: string): string {
  return value
    ? new Date(
        `${value.length === 16 ? value + ":00" : value}+09:00`,
      ).toISOString()
    : "";
}
