import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";

import CommunityTime from "./CommunityTime";

describe("CommunityTime", () => {
  afterEach(() => jest.restoreAllMocks());

  it("uses deterministic server text and interprets Community wall time as KST", () => {
    jest.spyOn(Date, "now").mockReturnValue(Date.parse("2026-11-11T10:47:21Z"));
    const value = "2026-11-10 00:37:53";
    expect(renderToString(<CommunityTime value={value} />)).toBe(
      '<time dateTime="2026-11-10T00:37:53+09:00">2026-11-10</time>',
    );
    render(<CommunityTime value={value} />);
    expect(screen.getByText("2일 전")).toHaveAttribute(
      "datetime",
      "2026-11-10T00:37:53+09:00",
    );
  });

  it.each(["2026-11-10T00:37:53Z", "2026-11-10T00:37:53+03:00"])(
    "preserves explicit offsets: %s",
    (value) => {
      const { container } = render(<CommunityTime value={value} />);
      expect(container.querySelector("time")).toHaveAttribute(
        "datetime",
        value,
      );
    },
  );

  it("does not throw on an unavailable timestamp", () => {
    render(<CommunityTime value="" />);
  });
});
