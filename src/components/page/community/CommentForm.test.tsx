import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";

import { clientAxios } from "@/lib/api/clients";

import CommentForm from "./CommentForm";

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));
jest.mock("@/lib/api/clients", () => ({
  clientAxios: { post: jest.fn() },
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

it("shows the backend error and preserves the draft when submission fails", async () => {
  jest.mocked(clientAxios.post).mockRejectedValue({
    isAxiosError: true,
    message: "Request failed with status code 503",
    response: { data: { message: "댓글 저장소가 잠시 불안정합니다." } },
  });
  render(<CommentForm postId="17" />);

  const textarea = screen.getByRole("textbox");
  fireEvent.change(textarea, { target: { value: "보존할 댓글" } });
  fireEvent.click(screen.getByRole("button", { name: "작성" }));

  await waitFor(() =>
    expect(toast.error).toHaveBeenCalledWith(
      "댓글 저장소가 잠시 불안정합니다.",
    ),
  );
  expect(textarea).toHaveValue("보존할 댓글");
});

it("clears the draft and refreshes the list only after a successful submission", async () => {
  jest.mocked(clientAxios.post).mockResolvedValue({ data: {} });
  const onSuccess = jest.fn();
  render(<CommentForm postId="17" onSuccess={onSuccess} />);

  const textarea = screen.getByRole("textbox");
  fireEvent.change(textarea, { target: { value: "등록할 댓글" } });
  fireEvent.click(screen.getByRole("button", { name: "작성" }));

  await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  expect(textarea).toHaveValue("");
  expect(toast.success).toHaveBeenCalledWith("댓글이 작성되었습니다.");
});
