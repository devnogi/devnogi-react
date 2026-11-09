import { calculateSourceCrop, clampCropPosition } from "./photo-crop";

describe("outfit photo crop", () => {
  it("moves a landscape crop from left to right inside a 3:4 frame", () => {
    const source = { width: 1904, height: 978 };
    const left = calculateSourceCrop(source, { x: -1, y: 0 });
    const center = calculateSourceCrop(source, { x: 0, y: 0 });
    const right = calculateSourceCrop(source, { x: 1, y: 0 });

    expect(left).toEqual({ x: 0, y: 0, width: 733.5, height: 978 });
    expect(center.x).toBeCloseTo(585.25);
    expect(right.x).toBeCloseTo(1170.5);
  });

  it("moves a portrait crop from top to bottom inside a 3:4 frame", () => {
    const source = { width: 1200, height: 2000 };
    const top = calculateSourceCrop(source, { x: 0, y: -1 });
    const center = calculateSourceCrop(source, { x: 0, y: 0 });
    const bottom = calculateSourceCrop(source, { x: 0, y: 1 });

    expect(top).toEqual({ x: 0, y: 0, width: 1200, height: 1600 });
    expect(center.y).toBe(200);
    expect(bottom.y).toBe(400);
  });

  it("clamps crop positions and rejects invalid image dimensions", () => {
    expect(clampCropPosition({ x: -4, y: 3 })).toEqual({ x: -1, y: 1 });
    expect(() =>
      calculateSourceCrop({ width: 0, height: 1200 }, { x: 0, y: 0 }),
    ).toThrow("사진 크기");
  });
});
