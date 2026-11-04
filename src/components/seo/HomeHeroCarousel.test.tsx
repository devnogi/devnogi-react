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
