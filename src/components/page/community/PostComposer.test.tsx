import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";

import PostComposer from "./PostComposer";

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { nickname: "나오", profileImageUrl: null },
    isAuthenticated: true,
  }),
}));
jest.mock("@/lib/api/clients", () => ({
  clientAxios: { post: jest.fn(), patch: jest.fn() },
}));
jest.mock("sonner", () => ({
  toast: { warning: jest.fn(), error: jest.fn(), success: jest.fn() },
}));

describe("PostComposer media previews", () => {
  const createObjectURL = jest.fn();
  const revokeObjectURL = jest.fn();

  beforeEach(() => {
    createObjectURL
      .mockReset()
      .mockReturnValueOnce("blob:first")
      .mockReturnValueOnce("blob:second");
    revokeObjectURL.mockReset();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
  });

  it("keeps active object URLs, supports keyboard buttons for ordering, and revokes removed URLs", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <PostComposer />
      </QueryClientProvider>,
    );
    const input = screen
      .getByLabelText("사진 또는 영상 첨부")
      .querySelector("input") as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [new File(["a"], "a.png", { type: "image/png" })] },
    });
    fireEvent.change(input, {
      target: { files: [new File(["b"], "b.png", { type: "image/png" })] },
    });
    expect(revokeObjectURL).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: "1번째 미디어 오른쪽으로 이동" }),
    );
    expect(screen.getByAltText("1번째 첨부 미리보기")).toHaveAttribute(
      "src",
      "blob:second",
    );
    fireEvent.click(screen.getByRole("button", { name: "1번째 미디어 삭제" }));
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:second");
  });
});
