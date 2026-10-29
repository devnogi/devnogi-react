import { metadata as authMetadata } from "./(auth)/layout";
import { metadata as adminMetadata } from "./(main)/admin/layout";
import { metadata as communityWriteMetadata } from "./(main)/community/write/layout";
import { metadata as myPageMetadata } from "./(main)/mypage/layout";
import { metadata as uiPreviewMetadata } from "./(main)/ui-preview/layout";

describe("internal route layouts", () => {
  it.each([
    authMetadata,
    adminMetadata,
    myPageMetadata,
    communityWriteMetadata,
    uiPreviewMetadata,
  ])("sets noindex, nofollow metadata", (metadata) => {
    expect(metadata).toMatchObject({
      robots: { index: false, follow: false },
    });
  });
});
