import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";

import { cropOutfitPhoto } from "@/lib/outfits/photo-crop";

import OutfitPhotoCropDialog from "./OutfitPhotoCropDialog";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    fill: _fill,
    unoptimized: _unoptimized,
    alt,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & {
    alt: string;
    fill?: boolean;
    unoptimized?: boolean;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));
jest.mock("@/lib/outfits/photo-crop", () => {
  const actual = jest.requireActual("@/lib/outfits/photo-crop");
  return { ...actual, cropOutfitPhoto: jest.fn() };
});

const source = new File(["source"], "wide.png", { type: "image/png" });
const cropped = new File(["cropped"], "wide-3x4.png", {
  type: "image/png",
});

beforeEach(() => {
  jest.mocked(cropOutfitPhoto).mockReset().mockResolvedValue(cropped);
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: jest.fn(() => "blob:wide"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: jest.fn(),
  });
});

it("lets the user drag a landscape photo and applies the selected crop", async () => {
  const onConfirm = jest.fn();
  render(
    <OutfitPhotoCropDialog
      file={source}
      current={1}
      total={2}
      onCancel={jest.fn()}
      onConfirm={onConfirm}
    />,
  );

  expect(screen.getByRole("dialog")).toHaveTextContent("1/2");
  const image = screen.getByAltText("자를 사진 미리보기");
  Object.defineProperties(image, {
    naturalWidth: { configurable: true, value: 1904 },
    naturalHeight: { configurable: true, value: 978 },
  });
  fireEvent.load(image);

  const frame = screen.getByLabelText("3대 4 사진 자르기 영역");
  Object.defineProperty(frame, "getBoundingClientRect", {
    configurable: true,
    value: () => ({ width: 300, height: 400 }),
  });
  Object.assign(frame, {
    setPointerCapture: jest.fn(),
    hasPointerCapture: jest.fn(() => true),
    releasePointerCapture: jest.fn(),
  });
  const pointerEvent = (
    type: string,
    values: { pointerId: number; clientX: number; clientY: number },
  ) => {
    const event = new Event(type, { bubbles: true });
    Object.assign(event, values);
    return event;
  };
  fireEvent(
    frame,
    pointerEvent("pointerdown", {
      pointerId: 1,
      clientX: 150,
      clientY: 200,
    }),
  );
  fireEvent(
    frame,
    pointerEvent("pointermove", {
      pointerId: 1,
      clientX: 75,
      clientY: 200,
    }),
  );
  fireEvent(
    frame,
    pointerEvent("pointerup", {
      pointerId: 1,
      clientX: 75,
      clientY: 200,
    }),
  );

  await waitFor(() =>
    expect(Number.parseFloat(image.style.objectPosition)).toBeGreaterThan(50),
  );
  fireEvent.click(screen.getByRole("button", { name: "이대로 적용" }));

  await waitFor(() => expect(onConfirm).toHaveBeenCalledWith(cropped));
  expect(jest.mocked(cropOutfitPhoto).mock.calls[0][1]).toMatchObject({ y: 0 });
  expect(jest.mocked(cropOutfitPhoto).mock.calls[0][1].x).toBeCloseTo(0.3133);
});

it("supports skipping the current photo", () => {
  const onCancel = jest.fn();
  render(
    <OutfitPhotoCropDialog
      file={source}
      current={1}
      total={1}
      onCancel={onCancel}
      onConfirm={jest.fn()}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "이 사진 건너뛰기" }));
  expect(onCancel).toHaveBeenCalledTimes(1);
});
