import { render, screen } from "@testing-library/react";

import type { HornBugleItem } from "@/types/horn-bugle";

import HornBugleList from "./HornBugleList";

const item: HornBugleItem = {
  id: 1,
  serverName: "류트",
  characterName: "밀레시안",
  message: "밀레시안 : 첫 줄\n둘째 줄",
  dateSend: "2026-11-06T20:57:00",
  dateRegister: "2026-11-06T20:57:00",
};

it("작성자와 정확히 일치하는 첫 접두어만 제거하고 본문과 KST 시각을 보존한다", () => {
  render(<HornBugleList items={[item]} isLoading={false} />);
  expect(screen.getByText("밀레시안")).toBeInTheDocument();
  expect(screen.getByText("첫 줄 둘째 줄", { selector: "p" }).textContent).toBe(
    "첫 줄\n둘째 줄",
  );
  expect(screen.getByText("11.06 20:57")).toHaveAttribute(
    "datetime",
    item.dateSend,
  );
  expect(screen.getByText("류트")).toBeInTheDocument();
});

it.each([
  ["다른이 : 내용", "다른이 : 내용"],
  ["밀레시안: 내용", "밀레시안: 내용"],
  ["본문 속 밀레시안 : 내용", "본문 속 밀레시안 : 내용"],
  ["밀레시안 : 밀레시안 : 내용", "밀레시안 : 내용"],
])("메시지 %s의 본문을 안전하게 표시한다", (message, expected) => {
  render(<HornBugleList items={[{ ...item, message }]} isLoading={false} />);
  expect(screen.getByText(expected, { selector: "p" })).toBeInTheDocument();
});

it("정규식 문자가 포함된 작성자 이름도 문자 그대로 비교한다", () => {
  render(
    <HornBugleList
      items={[{ ...item, characterName: "[A]+", message: "[A]+ : 내용" }]}
      isLoading={false}
    />,
  );
  expect(screen.getByText("내용", { selector: "p" })).toBeInTheDocument();
});

it("초기 로딩과 빈 상태를 구분하고 추가 로딩 중 기존 메시지는 유지한다", () => {
  const { rerender } = render(<HornBugleList items={[]} isLoading />);
  expect(
    screen.getByRole("status", { name: "뿔피리를 불러오는 중" }),
  ).toBeInTheDocument();
  rerender(<HornBugleList items={[]} isLoading={false} />);
  expect(screen.getByText("뿔피리 내역이 없습니다.")).toBeInTheDocument();
  rerender(<HornBugleList items={[item]} isLoading />);
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(screen.getByText("밀레시안")).toBeInTheDocument();
});
