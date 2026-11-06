import { fireEvent, render, screen } from "@testing-library/react";

import ItemInfoPage from "./ItemInfoPage";

const mockReplace = jest.fn();
let mockQuery = "";
const mockDetail = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/item-info",
  useSearchParams: () => new URLSearchParams(mockQuery),
}));
jest.mock("@/hooks/useItemInfoCategories", () => ({
  useItemInfoCategories: () => ({
    data: [{ topCategory: "기타", subCategories: [] }],
  }),
}));
jest.mock("@/hooks/useItemInfoDetail", () => ({
  useItemInfoDetail: (params: unknown) => {
    mockDetail(params);
    return {};
  },
}));
beforeEach(() => {
  mockQuery = "";
  jest.clearAllMocks();
});

it("도감 제목과 상위·하위 분류 이름을 제공한다", () => {
  render(<ItemInfoPage />);
  expect(
    screen.getByRole("heading", { name: "아이템 도감", level: 1 }),
  ).toBeVisible();
  expect(screen.getByRole("combobox", { name: "상위 분류" })).toBeVisible();
  expect(screen.getByRole("combobox", { name: "하위 분류" })).toBeVisible();
});

it("마운트와 히스토리 탐색에서는 URL을 쓰지 않고 현재 URL만 조회한다", () => {
  const view = render(<ItemInfoPage />);
  expect(mockDetail).toHaveBeenLastCalledWith(
    expect.objectContaining({ topCategory: "기타" }),
  );
  mockQuery = "topCategory=장비&subCategory=검&name=칼&page=3&direction=DESC";
  view.rerender(<ItemInfoPage />);
  expect(mockDetail).toHaveBeenLastCalledWith(
    expect.objectContaining({
      topCategory: "장비",
      subCategory: "검",
      name: "칼",
      page: 3,
      direction: "DESC",
    }),
  );
  expect(mockReplace).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: /이름순 내림차순/ }));
  expect(mockReplace).toHaveBeenCalledTimes(1);
  const query = new URL(mockReplace.mock.calls[0][0], "http://localhost")
    .searchParams;
  expect(Object.fromEntries(query)).toEqual({
    top_category: "장비",
    sub_category: "검",
    item_name: "칼",
  });
  mockQuery = query.toString();
  view.rerender(<ItemInfoPage />);
  expect(mockReplace).toHaveBeenCalledTimes(1);
});
