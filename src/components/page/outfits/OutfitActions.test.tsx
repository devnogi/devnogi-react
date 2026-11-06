import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { outfitRequest } from "@/lib/outfits/api";
import type { Outfit } from "@/types/outfits";

import OutfitActions from "./OutfitActions";
jest.mock("@/lib/outfits/api", () => ({
  outfitRequest: jest.fn(),
  outfitJson: (method: string, body: unknown) => ({
    method,
    body: JSON.stringify(body),
  }),
}));
const gate = jest.fn(() => true);
jest.mock("./OutfitAuth", () => ({ useOutfitAuth: () => gate }));
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));
jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));
const outfit = {
  id: 1,
  userId: 7,
  author: { nickname: "작성자" },
  content: "",
  likeCount: 4,
  commentCount: 0,
} as Outfit;
const mount = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <OutfitActions
        outfit={outfit}
        state={{ outfitId: 1, liked: false, bookmarked: false }}
      />
    </QueryClientProvider>,
  );
beforeEach(() => {
  gate.mockReturnValue(true);
  jest.mocked(outfitRequest).mockReset();
  Object.defineProperty(navigator, "share", {
    configurable: true,
    value: undefined,
  });
});
it("rolls back optimistic like when the request fails", async () => {
  jest.mocked(outfitRequest).mockRejectedValue(new Error("failed"));
  mount();
  fireEvent.click(screen.getByRole("button", { name: "좋아요" }));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "좋아요" })).toHaveAttribute(
      "aria-pressed",
      "false",
    ),
  );
  expect(screen.getByRole("button", { name: "좋아요" })).toHaveTextContent("4");
});
it("does not mutate for a guest gate", () => {
  gate.mockReturnValue(false);
  mount();
  fireEvent.click(screen.getByRole("button", { name: "즐겨찾기" }));
  expect(outfitRequest).not.toHaveBeenCalled();
});
it("does not record a cancelled native share", async () => {
  const share = jest
    .fn()
    .mockRejectedValue(new DOMException("Cancelled", "AbortError"));
  Object.defineProperty(navigator, "share", {
    configurable: true,
    value: share,
  });
  mount();
  fireEvent.click(screen.getByRole("button", { name: "공유하기" }));
  await waitFor(() => expect(share).toHaveBeenCalled());
  expect(outfitRequest).not.toHaveBeenCalled();
});
it("retries a completed share with the same idempotency id", async () => {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: jest.fn().mockResolvedValue(undefined) },
  });
  jest
    .mocked(outfitRequest)
    .mockRejectedValueOnce(new Error("timeout"))
    .mockResolvedValueOnce({ shareCount: 1 });
  mount();
  fireEvent.click(screen.getByRole("button", { name: "공유하기" }));
  await waitFor(() => expect(outfitRequest).toHaveBeenCalledTimes(2));
  expect(jest.mocked(outfitRequest).mock.calls[0][1]?.body).toBe(
    jest.mocked(outfitRequest).mock.calls[1][1]?.body,
  );
});
