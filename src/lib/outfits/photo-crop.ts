export const OUTFIT_PHOTO_ASPECT_RATIO = 3 / 4;
export const OUTFIT_PHOTO_MAX_WIDTH = 1200;
export const OUTFIT_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export interface CropPosition {
  x: number;
  y: number;
}

export interface ImageSize {
  width: number;
  height: number;
}

export interface SourceCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export function clampCropPosition(position: CropPosition): CropPosition {
  return {
    x: clamp(position.x, -1, 1),
    y: clamp(position.y, -1, 1),
  };
}

export function calculateSourceCrop(
  source: ImageSize,
  position: CropPosition,
): SourceCrop {
  if (source.width <= 0 || source.height <= 0)
    throw new Error("사진 크기를 확인하지 못했어요.");

  const normalized = clampCropPosition(position);
  const sourceRatio = source.width / source.height;

  if (sourceRatio > OUTFIT_PHOTO_ASPECT_RATIO) {
    const width = source.height * OUTFIT_PHOTO_ASPECT_RATIO;
    return {
      x: ((normalized.x + 1) / 2) * (source.width - width),
      y: 0,
      width,
      height: source.height,
    };
  }

  const height = source.width / OUTFIT_PHOTO_ASPECT_RATIO;
  return {
    x: 0,
    y: ((normalized.y + 1) / 2) * (source.height - height),
    width: source.width,
    height,
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("사진을 불러오지 못했어요."));
    };
    image.src = url;
  });
}

function canvasBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("사진을 자르지 못했어요."));
      },
      type,
      quality,
    );
  });
}

function outputType(file: File) {
  if (file.type === "image/jpeg" || file.type === "image/webp")
    return file.type;
  return "image/png";
}

function extensionFor(type: string) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/webp") return "webp";
  return "png";
}

export async function cropOutfitPhoto(
  file: File,
  position: CropPosition,
): Promise<File> {
  const image = await loadImage(file);
  const crop = calculateSourceCrop(
    { width: image.naturalWidth, height: image.naturalHeight },
    position,
  );
  const availableWidth = Math.min(OUTFIT_PHOTO_MAX_WIDTH, crop.width);
  const width = Math.max(3, Math.floor(availableWidth / 3) * 3);
  const height = (width / 3) * 4;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("사진 편집기를 시작하지 못했어요.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    width,
    height,
  );

  let type = outputType(file);
  let blob = await canvasBlob(
    canvas,
    type,
    type === "image/png" ? undefined : 0.97,
  );
  if (blob.size > OUTFIT_PHOTO_MAX_BYTES) {
    type = "image/webp";
    blob = await canvasBlob(canvas, type, 0.95);
  }
  if (blob.size > OUTFIT_PHOTO_MAX_BYTES)
    throw new Error("편집한 사진이 5MiB를 넘어요. 다른 사진을 선택해 주세요.");

  const baseName = file.name.replace(/\.[^.]+$/, "") || "outfit-photo";
  return new File([blob], `${baseName}-3x4.${extensionFor(type)}`, {
    type,
    lastModified: Date.now(),
  });
}
