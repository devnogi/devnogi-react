import { decodeItemKey, encodeItemKey, itemPath } from "./identity";

const item = {
  name: "별빛 / 검",
  topCategory: "근거리 장비",
  subCategory: "검/한손",
};

it("roundtrips Korean and slashes without normalizing stored values", () => {
  const key = encodeItemKey(item);
  expect(key).toMatch(/^[A-Za-z0-9_-]+$/);
  expect(decodeItemKey(key)).toEqual(item);
  expect(itemPath(item)).toBe(`/items/${key}`);
  const spaced = { ...item, name: " 별빛 / 검 " };
  expect(decodeItemKey(encodeItemKey(spaced))).toEqual(spaced);
  expect(encodeItemKey(spaced)).not.toBe(key);
});

it("distinguishes identical names in different categories", () => {
  expect(encodeItemKey(item)).not.toBe(
    encodeItemKey({ ...item, subCategory: "양손검" }),
  );
});

it("accepts a valid alternative JSON representation for canonical redirects", () => {
  const key = Buffer.from(
    JSON.stringify([item.topCategory, item.subCategory, item.name], null, 2),
  ).toString("base64url");
  expect(decodeItemKey(key)).toEqual(item);
  expect(key).not.toBe(encodeItemKey(item));
});

it.each([
  "",
  "%%%",
  "a",
  "_w",
  Buffer.from('["a","b"]').toString("base64url"),
  Buffer.from('["a","b",""]').toString("base64url"),
  Buffer.from(JSON.stringify(["a".repeat(26), "b", "c"])).toString("base64url"),
])("rejects malformed identity %s", (key) => {
  expect(decodeItemKey(key)).toBeNull();
});
