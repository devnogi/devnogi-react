import { getPublicOutfits } from "@/lib/outfits/public-feed";
import { PublicApiError } from "@/lib/seo/public-api";

import Page, { generateMetadata } from "./page";

jest.mock("@/lib/outfits/public-feed", () => ({ getPublicOutfits: jest.fn() }));
jest.mock("@/components/page/outfits/OutfitFeed", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));
const props = (query: Record<string, string | undefined> = {}) => ({
  searchParams: Promise.resolve(query),
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(getPublicOutfits).mockResolvedValue({
    content: [{ id: 1 }],
    hasNext: false,
    nextCursor: null,
  } as Awaited<ReturnType<typeof getPublicOutfits>>);
});

it("uses a self canonical for crawlable cursor pages", async () => {
  expect(await generateMetadata(props({ cursor: "abc" }))).toMatchObject({
    alternates: { canonical: "/outfits?cursor=abc" },
    robots: { index: true },
  });
  expect(getPublicOutfits).toHaveBeenCalledWith("cursor=abc");
  const page = await Page(props({ cursor: "abc" }));
  expect(page.props.children.props.initialCursor).toBe("abc");
});

it.each([{ sort: "POPULAR" }, { tags: "겨울" }, { motion: "true" }])(
  "keeps filter variants out of the index: %j",
  async (query) => {
    expect(await generateMetadata(props(query))).toMatchObject({
      alternates: { canonical: "/outfits" },
      robots: { index: false, follow: true },
    });
  },
);

it("distinguishes empty, missing cursor, and unavailable provider", async () => {
  jest
    .mocked(getPublicOutfits)
    .mockResolvedValue({ content: [], hasNext: false, nextCursor: null });
  await expect(Page(props())).resolves.toBeDefined();
  await expect(generateMetadata(props({ cursor: "abc" }))).rejects.toThrow(
    "NOT_FOUND",
  );
  jest.mocked(getPublicOutfits).mockRejectedValue(new PublicApiError(503));
  await expect(generateMetadata(props())).rejects.toBeInstanceOf(
    PublicApiError,
  );
});
