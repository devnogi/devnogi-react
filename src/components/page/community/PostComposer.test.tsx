import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { useAuth } from "@/contexts/AuthContext";
import { clientAxios } from "@/lib/api/clients";

import PostComposer from "./PostComposer";

jest.mock("@/contexts/AuthContext", () => ({ useAuth: jest.fn() }));
jest.mock("@/lib/api/clients", () => ({
  clientAxios: { post: jest.fn(), patch: jest.fn() },
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
}));

beforeEach(() => {
  jest.mocked(useAuth).mockReturnValue({
    user: { nickname: "나오", profileImageUrl: null },
    isAuthenticated: true,
  } as ReturnType<typeof useAuth>);
  jest.mocked(clientAxios.post).mockReset();
  jest.mocked(clientAxios.patch).mockReset();
});

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

it("두 게시글 작성 화면이 공유하는 payload에 boolean isDraft를 전송한다", async () => {
  jest.mocked(clientAxios.post).mockResolvedValue({ data: {} });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <PostComposer />
    </QueryClientProvider>,
  );

  fireEvent.change(screen.getByLabelText("게시글 내용"), {
    target: { value: "새 게시글" },
  });
  fireEvent.click(screen.getByRole("button", { name: "게시" }));

  await waitFor(() => expect(clientAxios.post).toHaveBeenCalledTimes(1));
  const [path, form] = jest.mocked(clientAxios.post).mock.calls[0] as [
    string,
    FormData,
  ];
  expect(path).toBe("/posts");
  const data = form.get("data");
  expect(data).toBeInstanceOf(Blob);
  await expect((data as Blob).text()).resolves.toContain('"isDraft":false');
});
