import { fireEvent, render, screen } from "@testing-library/react";

import { EMPTY_GAME_PROFILE_DRAFT } from "@/types/profile";

import GameProfileFields from "./GameProfileFields";

it("길드와 자기소개를 UTF-16이 아닌 Unicode code point 기준으로 제한한다", () => {
  const onChange = jest.fn();
  const { rerender } = render(
    <GameProfileFields
      value={EMPTY_GAME_PROFILE_DRAFT}
      onChange={onChange}
      idPrefix="test-profile"
    />,
  );
  fireEvent.change(screen.getByLabelText(/^길드/), {
    target: { value: "🌿".repeat(31) },
  });
  expect(onChange).toHaveBeenLastCalledWith(
    expect.objectContaining({ guildName: "🌿".repeat(30) }),
  );

  rerender(
    <GameProfileFields
      value={{ ...EMPTY_GAME_PROFILE_DRAFT, bio: "🌿".repeat(50) }}
      onChange={onChange}
      idPrefix="test-profile"
    />,
  );
  expect(screen.getByText("50/50")).toBeInTheDocument();
});
