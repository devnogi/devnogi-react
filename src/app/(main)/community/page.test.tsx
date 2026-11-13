import { getPublicFeed } from "@/lib/community/public-feed";
import { PublicApiError } from "@/lib/seo/public-api";

import Page, { generateMetadata } from "./page";

jest.mock("@/lib/community/public-feed", () => ({ getPublicFeed: jest.fn() }));
jest.mock("./CommunityClient", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));
const props = (query: Record<string, string | string[]> = {}) => ({
  searchParams: Promise.resolve(query),
});
const initial = {
  items: [{ id: 42 }],
  meta: {
    currentPage: 2,
    isLast: false,
    pageSize: 20,
    totalPages: 3,
    totalElements: 42,
    isFirst: false,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(getPublicFeed)
    .mockResolvedValue(initial as Awaited<ReturnType<typeof getPublicFeed>>);
});

it("supplies the server page to the feed and uses its own canonical", async () => {
  const page = await Page(props({ page: "2" }));
  expect(page.props).toMatchObject({ initial, startPage: 2 });
  expect(getPublicFeed).toHaveBeenCalledWith(2, "");
  expect(await generateMetadata(props({ page: "2" }))).toMatchObject({
    alternates: { canonical: "/community?page=2" },
    robots: { index: true, follow: true },
  });
});

it("keeps search results out of the index", async () => {
  expect(await generateMetadata(props({ q: "에린" }))).toMatchObject({
    robots: { index: false, follow: true },
  });
  expect(getPublicFeed).toHaveBeenCalledWith(1, "에린");
});

it.each(["0", "-1", "NaN", "1.2", ["1", "2"]])(
  "rejects an invalid page %s",
  async (page) => {
    await expect(generateMetadata(props({ page }))).rejects.toThrow(
      "NOT_FOUND",
    );
    expect(getPublicFeed).not.toHaveBeenCalled();
  },
);

it("distinguishes an empty first page, an absent later page, and an outage", async () => {
  jest
    .mocked(getPublicFeed)
    .mockResolvedValue({ ...initial, items: [] } as Awaited<
      ReturnType<typeof getPublicFeed>
    >);
  await expect(Page(props())).resolves.toBeDefined();
  await expect(Page(props({ page: "2" }))).rejects.toThrow("NOT_FOUND");
  jest.mocked(getPublicFeed).mockRejectedValue(new PublicApiError(503));
  await expect(generateMetadata(props())).rejects.toBeInstanceOf(
    PublicApiError,
  );
});
