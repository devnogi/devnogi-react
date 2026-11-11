import { render, screen } from "@testing-library/react";

import { ACTIVITY_GRADE_LABELS, type ActivityGrade } from "@/types/experience";

import ActivityGradeBadge from "./ActivityGradeBadge";

it.each(Object.entries(ACTIVITY_GRADE_LABELS))(
  "인증된 %s 등급을 표시한다",
  (grade, label) => {
    render(<ActivityGradeBadge grade={grade as ActivityGrade} verified />);
    expect(screen.getByLabelText(`활동 등급: ${label}`)).toHaveTextContent(
      label,
    );
  },
);

it.each([undefined, null, "EXPERT", "UNKNOWN"])(
  "미인증 회원은 %s 등급을 표시하지 않는다",
  (grade) => {
    const { container } = render(
      <ActivityGradeBadge
        grade={grade as ActivityGrade | undefined}
        verified={false}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  },
);

it("구버전 응답의 누락 필드와 알 수 없는 등급은 표시하지 않는다", () => {
  const { container, rerender } = render(<ActivityGradeBadge verified />);
  expect(container).toBeEmptyDOMElement();
  rerender(<ActivityGradeBadge grade={"UNKNOWN" as ActivityGrade} verified />);
  expect(container).toBeEmptyDOMElement();
});
