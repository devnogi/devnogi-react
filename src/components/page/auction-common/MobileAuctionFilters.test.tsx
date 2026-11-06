import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import HistoryChips from "../auction-history/MobileFilterChips";
import HistoryModal from "../auction-history/MobileFilterModal";
import RealtimeChips from "../auction-realtime/MobileFilterChips";
import RealtimeModal from "../auction-realtime/MobileFilterModal";

let mockOptionsAvailable = true;

jest.mock("@/hooks/useSearchOptions", () => {
  const data = [
    {
      id: 1,
      searchOptionName: "최대 공격력",
      displayOrder: 1,
      searchCondition: {
        attackMaxFrom: { type: "number", required: false },
        attackMaxTo: { type: "number", required: false },
      },
    },
  ];
  return {
    useSearchOptions: () => ({ data: mockOptionsAvailable ? data : undefined }),
  };
});
jest.mock("@/hooks/useEnchantFullnames", () => ({
  useEnchantFullnames: () => ({
    prefixList: [],
    suffixList: [],
    isLoading: false,
  }),
}));
jest.mock("@/hooks/useMetalwareInfos", () => ({
  useMetalwareInfos: () => ({
    metalwareList: ["최대 대미지", "마법 공격력"],
    isLoading: false,
  }),
}));

describe.each([
  ["history", HistoryChips, HistoryModal],
  ["realtime", RealtimeChips, RealtimeModal],
] as const)("%s mobile filters", (_name, Chips, Modal) => {
  beforeEach(() => {
    mockOptionsAvailable = true;
  });
  it("announces selected filters and keeps every filter action available", async () => {
    const onPriceClick = jest.fn();
    const onExactItemNameToggle = jest.fn();
    render(
      <Chips
        activeFilters={{
          hasExactItemName: true,
          hasCategory: false,
          hasPrice: true,
          hasDate: false,
          hasOptions: false,
          hasEnchant: false,
          hasMetalware: false,
        }}
        onExactItemNameToggle={onExactItemNameToggle}
        onCategoryClick={jest.fn()}
        onPriceClick={onPriceClick}
        onDateClick={jest.fn()}
        onOptionsClick={jest.fn()}
        onEnchantClick={jest.fn()}
        onMetalwareClick={jest.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "완전 일치" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "금액" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await userEvent.click(screen.getByRole("button", { name: "금액" }));
    await userEvent.click(screen.getByRole("button", { name: "완전 일치" }));
    expect(onPriceClick).toHaveBeenCalledTimes(1);
    expect(onExactItemNameToggle).toHaveBeenCalledTimes(1);
  });

  it("applies price input and closes through the existing contract", async () => {
    const onApply = jest.fn();
    const onClose = jest.fn();
    render(
      <Modal
        isOpen
        filterType="price"
        onClose={onClose}
        onApply={onApply}
        initialData={{ priceMin: "100", priceMax: "900" }}
      />,
    );
    const dialog = screen.getByRole("dialog", { name: "필터" });
    fireEvent.change(within(dialog).getByPlaceholderText("최소 금액 입력"), {
      target: { value: "200" },
    });
    await userEvent.click(
      within(dialog).getByRole("button", { name: "적용하기" }),
    );
    expect(onApply).toHaveBeenCalledWith({ priceMin: "200", priceMax: "900" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("selects populated metalware suggestions inside the modal with pointer and keyboard", async () => {
    const onApply = jest.fn();
    render(
      <Modal
        isOpen
        filterType="metalware"
        onClose={jest.fn()}
        onApply={onApply}
      />,
    );
    const dialog = screen.getByRole("dialog", { name: "필터" });
    await userEvent.click(
      within(dialog).getByRole("button", { name: "세공 조건 추가 (최대 3개)" }),
    );
    const input = within(dialog).getByPlaceholderText("세공 이름 입력");
    await userEvent.click(input);
    await userEvent.click(
      await within(dialog).findByRole("button", { name: "최대 대미지" }),
    );
    expect(input).toHaveValue("최대 대미지");
    await userEvent.clear(input);
    const suggestion = await within(dialog).findByRole("button", {
      name: "마법 공격력",
    });
    suggestion.focus();
    await userEvent.keyboard("{Enter}");
    expect(input).toHaveValue("마법 공격력");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "적용하기" }),
    );
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        metalwareItems: [expect.objectContaining({ name: "마법 공격력" })],
      }),
    );
  });

  it("waits for unavailable metadata without losing incoming options", async () => {
    mockOptionsAvailable = false;
    const initialData = {
      optionRequest: { attackMaxSearch: { attackMaxFrom: 10 } },
    };
    const onApply = jest.fn();
    const view = render(
      <Modal
        isOpen
        filterType="options"
        onClose={jest.fn()}
        onApply={onApply}
        initialData={initialData}
      />,
    );
    expect(screen.getByRole("button", { name: "적용하기" })).toBeDisabled();
    expect(onApply).not.toHaveBeenCalled();
    mockOptionsAvailable = true;
    view.rerender(
      <Modal
        isOpen
        filterType="options"
        onClose={jest.fn()}
        onApply={onApply}
        initialData={initialData}
      />,
    );
    expect(await screen.findByPlaceholderText("최소")).toHaveValue(10);
    expect(screen.getByRole("button", { name: "적용하기" })).toBeEnabled();
  });

  it("hydrates incoming options and supports editing and reset", async () => {
    const onApply = jest.fn();
    render(
      <Modal
        isOpen
        filterType="options"
        onClose={jest.fn()}
        onApply={onApply}
        initialData={{
          optionRequest: { attackMaxSearch: { attackMaxFrom: 10 } },
        }}
      />,
    );
    const minimum = await screen.findByPlaceholderText("최소");
    expect(minimum).toHaveValue(10);
    fireEvent.change(minimum, { target: { value: "20" } });
    await userEvent.click(screen.getByRole("button", { name: "적용하기" }));
    expect(onApply).toHaveBeenLastCalledWith({
      activeFilters: [
        expect.objectContaining({ values: { attackMaxFrom: "20" } }),
      ],
    });
    await userEvent.click(screen.getByRole("button", { name: "초기화" }));
    await userEvent.click(screen.getByRole("button", { name: "적용하기" }));
    expect(onApply).toHaveBeenLastCalledWith({ activeFilters: [] });
  });

  it("resets only the current price fields and supports Escape", async () => {
    const onApply = jest.fn();
    const onClose = jest.fn();
    render(
      <Modal
        isOpen
        filterType="price"
        onClose={onClose}
        onApply={onApply}
        initialData={{ priceMin: "100", priceMax: "900" }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "초기화" }));
    expect(screen.getByPlaceholderText("최소 금액 입력")).toHaveValue(null);
    expect(screen.getByPlaceholderText("최대 금액 입력")).toHaveValue(null);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onApply).not.toHaveBeenCalled();
  });
});
