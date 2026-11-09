import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { outfitRequest } from "@/lib/outfits/api";
import type { Outfit, OutfitItem } from "@/types/outfits";

import OutfitComposer from "./OutfitComposer";
jest.mock("@/lib/outfits/api", () => ({ outfitRequest: jest.fn() }));
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { userId: 7 }, isLoading: false }),
}));
const push = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, back: jest.fn() }),
}));
jest.mock("next/image", () => ({ __esModule: true, default: () => null }));
jest.mock("./OutfitAuth", () => ({ useOutfitAuth: () => () => true }));
jest.mock("./ItemPicker", () => ({ __esModule: true, default: () => null }));
jest.mock("./OutfitPhotoCropDialog", () => ({
  __esModule: true,
  default: ({
    file,
    onConfirm,
  }: {
    file: File;
    onConfirm: (file: File) => void;
  }) => (
    <div role="dialog">
      <span>{file.name}</span>
      <button
        type="button"
        onClick={() =>
          onConfirm(
            new File(
              ["cropped"],
              `${file.name.replace(/\.[^.]+$/, "")}-3x4.png`,
              { type: "image/png" },
            ),
          )
        }
      >
        크롭 적용
      </button>
    </div>
  ),
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn() } }));
const items: OutfitItem[] = ["CLOTHING", "HANDS", "FEET"].map((slot) => ({
  slot: slot as OutfitItem["slot"],
  inputType: "CATALOG",
  name: "착용 아이템",
  topCategory: "분류",
  subCategory: "하위",
}));
const initial: Outfit = {
  id: 1,
  userId: 7,
  author: {
    nickname: "작성자",
    profileImageUrl: null,
    serverName: null,
    verified: false,
  },
  likeCount: 0,
  commentCount: 0,
  shareCount: 0,
  createdAt: "2026-11-07T00:00:00Z",
  updatedAt: "2026-11-07T00:00:00Z",
  content: "기존 이야기",
  tags: [],
  items,
  images: [
    { id: 10, url: "/photo.png", displayOrder: 0 },
    { id: 11, url: "/photo2.png", displayOrder: 1 },
  ],
};
function mount(outfit = initial) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnMount: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <OutfitComposer initial={outfit} />
    </QueryClientProvider>,
  );
  return client;
}
beforeEach(() => {
  jest.mocked(outfitRequest).mockReset();
  push.mockClear();
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: jest.fn(() => "blob:cropped"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: jest.fn(),
  });
});
it("blocks saving without required gloves", () => {
  mount({ ...initial, items: items.filter((item) => item.slot !== "HANDS") });
  fireEvent.click(screen.getByRole("button", { name: "의장 저장" }));
  expect(screen.getByRole("alert")).toHaveTextContent("손(장갑)");
  expect(outfitRequest).not.toHaveBeenCalled();
});
it("preserves the draft after a failed save", async () => {
  jest.mocked(outfitRequest).mockRejectedValue(new Error("카탈로그 일시 오류"));
  mount();
  fireEvent.change(screen.getByRole("textbox", { name: /이야기/ }), {
    target: { value: "수정한 이야기" },
  });
  fireEvent.click(screen.getByRole("button", { name: "의장 저장" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "카탈로그 일시 오류",
  );
  expect(screen.getByRole("textbox", { name: /이야기/ })).toHaveValue(
    "수정한 이야기",
  );
  expect(push).not.toHaveBeenCalled();
});
it("submits ordered retained image ids and navigates to the saved detail", async () => {
  jest.mocked(outfitRequest).mockResolvedValue(initial);
  const cache = mount();
  cache.setQueryData(["outfits", "feed", "public"], {
    pages: [{ content: [] }],
    pageParams: [0],
  });
  fireEvent.click(screen.getAllByRole("button", { name: "대표로" })[1]);
  fireEvent.click(screen.getByRole("button", { name: "의장 저장" }));
  await waitFor(() => expect(push).toHaveBeenCalledWith("/outfits/1"));
  expect(cache.getQueryData(["outfits", "feed", "public"])).toBeUndefined();
  const [, request] = jest.mocked(outfitRequest).mock.calls[0];
  expect(request?.method).toBe("PUT");
  const data = (request?.body as FormData).get("data") as Blob;
  const json = await data.text();
  expect(JSON.parse(json)).toMatchObject({
    mediaOrder: [{ imageId: 11 }, { imageId: 10 }],
    items,
    content: "기존 이야기",
  });
});

it("opens the crop editor and uploads only the cropped 3:4 file", async () => {
  jest.mocked(outfitRequest).mockResolvedValue(initial);
  const append = jest.spyOn(FormData.prototype, "append");
  mount();
  const source = new File(["wide"], "wide.png", { type: "image/png" });
  fireEvent.change(screen.getByLabelText(/사진 추가/), {
    target: { files: [source] },
  });

  expect(screen.getByRole("dialog")).toHaveTextContent("wide.png");
  expect(screen.getByRole("button", { name: "의장 저장" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "크롭 적용" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "의장 저장" }));
  await waitFor(() => expect(outfitRequest).toHaveBeenCalled());
  const [, request] = jest.mocked(outfitRequest).mock.calls[0];
  const form = request?.body as FormData;
  const uploaded = append.mock.calls.find(([key]) => key === "media")?.[1];
  expect(uploaded).toMatchObject({
    name: "wide-3x4.png",
    type: "image/png",
  });
  const data = form.get("data") as Blob;
  expect(JSON.parse(await data.text()).mediaOrder).toEqual([
    { imageId: 10 },
    { imageId: 11 },
    { uploadIndex: 0 },
  ]);
  append.mockRestore();
});

it("keeps multiple cropped uploads in the selected order", async () => {
  jest.mocked(outfitRequest).mockResolvedValue(initial);
  const append = jest.spyOn(FormData.prototype, "append");
  mount({ ...initial, images: [] });
  const first = new File(["first"], "first.png", { type: "image/png" });
  const second = new File(["second"], "second.png", { type: "image/png" });
  fireEvent.change(screen.getByLabelText(/사진 추가/), {
    target: { files: [first, second] },
  });

  expect(screen.getByRole("dialog")).toHaveTextContent("first.png");
  fireEvent.click(screen.getByRole("button", { name: "크롭 적용" }));
  expect(screen.getByRole("dialog")).toHaveTextContent("second.png");
  fireEvent.click(screen.getByRole("button", { name: "크롭 적용" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "의장 저장" }));
  await waitFor(() => expect(outfitRequest).toHaveBeenCalled());
  const uploads = append.mock.calls
    .filter(([key]) => key === "media")
    .map(([, file]) => (file as File).name);
  expect(uploads).toEqual(["first-3x4.png", "second-3x4.png"]);
  append.mockRestore();
});
