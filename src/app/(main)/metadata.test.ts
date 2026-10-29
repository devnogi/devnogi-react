import { metadata as auctionRealtimeMetadata } from "./auction-realtime/layout";
import { metadata as communityMetadata } from "./community/layout";
import { metadata as hornBugleMetadata } from "./horn-bugle/layout";
import { metadata as itemInfoMetadata } from "./item-info/layout";
import { metadata as itemOptionInfoMetadata } from "./item-option-info/layout";
import { metadata as statisticsMetadata } from "./statistics/layout";

const indexedMetadata = [
  [auctionRealtimeMetadata, "/auction-realtime"],
  [communityMetadata, "/community"],
  [hornBugleMetadata, "/horn-bugle"],
  [itemInfoMetadata, "/item-info"],
  [itemOptionInfoMetadata, "/item-option-info"],
  [statisticsMetadata, "/statistics"],
] as const;

describe("public sitemap route metadata", () => {
  it.each(indexedMetadata)(
    "adds page-specific canonical and social metadata for %s",
    (metadata, pathname) => {
      expect(metadata).toMatchObject({
        alternates: { canonical: pathname },
        openGraph: { url: pathname },
        twitter: { card: "summary" },
      });
    },
  );
});
