import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";

import { outfitRequest } from "@/lib/outfits/api";
import type { OutfitItem, OutfitSlot } from "@/types/outfits";

import ItemPicker from "./ItemPicker";
jest.mock("@/lib/outfits/api", () => ({ outfitRequest: jest.fn() }));
function Harness({
  slot = "CLOTHING",
  initial,
}: {
  slot?: OutfitSlot;
  initial?: OutfitItem;
}) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <ItemPicker slot={slot} value={value} onChange={setValue} />
      <output data-testid="selected">{value?.name ?? "none"}</output>
    </>
  );
}
function mount(element: React.ReactNode) {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      {element}
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  jest.mocked(outfitRequest).mockReset();
  jest
    .mocked(outfitRequest)
    .mockResolvedValue([
      { name: "선택 의상", topCategory: "갑옷 장비", subCategory: "천옷" },
    ]);
});
it("invalidates selection without erasing edited input", async () => {
  mount(
    <Harness
      initial={{
        slot: "CLOTHING",
        inputType: "CATALOG",
        name: "기존 의상",
        topCategory: "갑옷 장비",
        subCategory: "천옷",
      }}
    />,
  );
  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "다른 의상" },
  });
  expect(screen.getByRole("combobox")).toHaveValue("다른 의상");
  expect(screen.getByTestId("selected")).toHaveTextContent("none");
  await waitFor(() => expect(outfitRequest).toHaveBeenCalled());
});
it("selects catalog candidates by keyboard", async () => {
  mount(<Harness />);
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "선택" } });
  await screen.findByRole("option");
  fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
  fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
  expect(screen.getByTestId("selected")).toHaveTextContent("선택 의상");
});
it("allows custom motion even when the catalog fails", async () => {
  jest.mocked(outfitRequest).mockRejectedValue(new Error("offline"));
  mount(<Harness slot="MOTION" />);
  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "의상 전용 동작" },
  });
  fireEvent.click(
    await screen.findByRole("button", { name: /모션으로 직접 입력/ }),
  );
  expect(screen.getByTestId("selected")).toHaveTextContent("의상 전용 동작");
});
