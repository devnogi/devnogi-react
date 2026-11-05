import { fireEvent, render, screen } from "@testing-library/react";

import AuctionItemSearch from "./AuctionItemSearch";

jest.mock("@/hooks/useItemInfos", () => ({
  useItemInfos: () => ({
    data: [
      { name: "롱소드", topCategory: "근거리 장비", subCategory: "검" },
      { name: "숏소드", topCategory: "근거리 장비", subCategory: "검" },
    ],
    isLoading: false,
  }),
}));

describe("AuctionItemSearch", () => {
  it("submits direct input", () => {
    const onSearch = jest.fn();
    render(<AuctionItemSearch value="" onSearch={onSearch} />);

    fireEvent.change(screen.getByLabelText("아이템 검색"), {
      target: { value: "  임의의 검  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "검색" }));

    expect(onSearch).toHaveBeenCalledWith("임의의 검");
  });

  it("applies the selected autocomplete item and its categories", () => {
    const onSearch = jest.fn();
    render(<AuctionItemSearch value="" onSearch={onSearch} />);

    fireEvent.change(screen.getByLabelText("아이템 검색"), {
      target: { value: "롱" },
    });
    fireEvent.mouseDown(screen.getByRole("option", { name: /롱소드/ }));

    expect(onSearch).toHaveBeenCalledWith("롱소드", {
      name: "롱소드",
      topCategory: "근거리 장비",
      subCategory: "검",
    });
  });

  it("clears the active item search immediately", () => {
    const onSearch = jest.fn();
    render(<AuctionItemSearch value="롱소드" onSearch={onSearch} />);

    fireEvent.click(
      screen.getByRole("button", { name: "아이템 검색어 지우기" }),
    );

    expect(onSearch).toHaveBeenCalledWith("");
    expect(screen.getByLabelText("아이템 검색")).toHaveValue("");
  });
});
