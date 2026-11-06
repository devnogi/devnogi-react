import { act, fireEvent, render, screen } from "@testing-library/react";

import HomeHeroCarousel from "./HomeHeroCarousel";

const matchMedia = jest.fn();

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: matchMedia,
  });
});

beforeEach(() => {
  jest.useFakeTimers();
  matchMedia.mockReturnValue({ matches: false });
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  matchMedia.mockReset();
});

it("두 Hero 이미지를 일정 시간마다 교차 전환한다", () => {
  render(<HomeHeroCarousel />);

  const slides = screen.getAllByTestId("hero-slide");
  expect(slides).toHaveLength(2);
  expect(slides[0]).toHaveAttribute("data-active", "true");
  expect(slides[1]).toHaveAttribute(
    "src",
    expect.stringContaining("home-hero-winter.png"),
  );

  act(() => {
    jest.advanceTimersByTime(7_000);
  });

  expect(slides[0]).toHaveAttribute("data-active", "false");
  expect(slides[1]).toHaveAttribute("data-active", "true");
});

it("모션 감소 설정에서는 자동 전환하지 않는다", () => {
  matchMedia.mockReturnValue({ matches: true });
  render(<HomeHeroCarousel />);

  const slides = screen.getAllByTestId("hero-slide");
  act(() => {
    jest.advanceTimersByTime(14_000);
  });

  expect(slides[0]).toHaveAttribute("data-active", "true");
  expect(slides[1]).toHaveAttribute("data-active", "false");
});

it("좌우 버튼으로 Hero 이미지를 직접 이동한다", () => {
  render(<HomeHeroCarousel />);

  const slides = screen.getAllByTestId("hero-slide");
  fireEvent.click(screen.getByRole("button", { name: "다음 Hero 이미지" }));
  expect(slides[1]).toHaveAttribute("data-active", "true");

  fireEvent.click(screen.getByRole("button", { name: "이전 Hero 이미지" }));
  expect(slides[0]).toHaveAttribute("data-active", "true");
});

it("정지와 재개 및 방향키로 전환을 제어한다", () => {
  render(<HomeHeroCarousel />);
  const slides = screen.getAllByTestId("hero-slide");
  fireEvent.click(screen.getByRole("button", { name: "Hero 자동 전환 정지" }));
  act(() => {
    jest.advanceTimersByTime(14000);
  });
  expect(slides[0]).toHaveAttribute("data-active", "true");
  fireEvent.keyDown(screen.getByRole("button", { name: "다음 Hero 이미지" }), {
    key: "ArrowRight",
  });
  expect(slides[1]).toHaveAttribute("data-active", "true");
  fireEvent.click(screen.getByRole("button", { name: "Hero 자동 전환 재개" }));
  act(() => {
    jest.advanceTimersByTime(7000);
  });
  expect(slides[0]).toHaveAttribute("data-active", "true");
});
it("실행 중 모션 감소 설정이 바뀌면 자동 전환을 멈춘다", () => {
  let listener: () => void = () => {};
  const query = {
    matches: false,
    addEventListener: jest.fn((_: string, callback: () => void) => {
      listener = callback;
    }),
    removeEventListener: jest.fn(),
  };
  matchMedia.mockReturnValue(query);
  const { unmount } = render(<HomeHeroCarousel />);
  act(() => {
    query.matches = true;
    listener();
    jest.advanceTimersByTime(14000);
  });
  expect(screen.getAllByTestId("hero-slide")[0]).toHaveAttribute(
    "data-active",
    "true",
  );
  expect(
    screen.getByRole("button", { name: "모션 감소 설정으로 자동 전환 정지" }),
  ).toBeDisabled();
  unmount();
  expect(query.removeEventListener).toHaveBeenCalled();
});
