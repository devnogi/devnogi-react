import { render } from "@testing-library/react";

import HomePage, { metadata } from "./page";

jest.mock("@/components/seo/HomeLanding", () => {
  function MockHomeLanding() {
    return <div />;
  }
  return MockHomeLanding;
});

it("홈 메타데이터와 WebSite JSON-LD에 기존 검색 키워드를 유지한다", () => {
  const title = "마비노기 경매장·시세·아이템 정보";
  expect(metadata.title).toBe(title);
  expect(metadata.description).toContain("마비노기 경매장 거래내역");
  expect(metadata.openGraph).toMatchObject({
    title,
    description: metadata.description,
  });
  expect(metadata.twitter).toMatchObject({
    title,
    description: metadata.description,
  });
  const { container } = render(<HomePage />);
  const website = Array.from(
    container.querySelectorAll('script[type="application/ld+json"]'),
  )
    .map((script) => JSON.parse(script.textContent || "{}"))
    .find((data) => data["@type"] === "WebSite");
  expect(website.description).toBe(metadata.description);
  expect(website.potentialAction).toBeUndefined();
});
