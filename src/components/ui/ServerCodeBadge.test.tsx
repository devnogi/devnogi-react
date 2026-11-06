import { render, screen } from "@testing-library/react";

import ServerCodeBadge from "./ServerCodeBadge";

it.each([
  ["류트", "LT"],
  ["만돌린", "MD"],
  ["하프", "HP"],
  ["울프", "WF"],
])("인증된 %s 서버를 %s 약어로 표시한다", (serverName, code) => {
  render(<ServerCodeBadge serverName={serverName} verified />);
  expect(screen.getByLabelText(`${serverName} 서버`)).toHaveTextContent(code);
});

it.each([
  ["류트", false],
  ["알반", true],
  [null, true],
] as const)(
  "미인증 또는 미지원 서버에는 배지를 숨긴다",
  (serverName, verified) => {
    const { container } = render(
      <ServerCodeBadge serverName={serverName} verified={verified} />,
    );
    expect(container).toBeEmptyDOMElement();
  },
);
