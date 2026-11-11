import { render, screen } from "@testing-library/react";

import PublicProfileHeader from "./PublicProfileHeader";

it("null 항목은 숨기고 설정된 게임 프로필만 표시한다", () => {
  render(
    <PublicProfileHeader
      profile={{
        userId: 42,
        nickname: "밀레시안",
        profileImageUrl: null,
        serverName: "류트",
        verified: true,
        activityGrade: "EXPERT",
        verificationCount: 3,
        mainChannel: 7,
        guildName: null,
        race: "ELF",
        arcana: null,
        preferredColors: ["10.20.30", "200.210.220"],
        mbti: null,
        bio: "에린의 생활을 기록합니다.",
      }}
    />,
  );

  expect(screen.getByRole("heading", { name: "밀레시안" })).toBeInTheDocument();
  expect(screen.getByText("인게임 인증 · 3회")).toBeInTheDocument();
  expect(screen.getByLabelText("활동 등급: 달인")).toBeInTheDocument();
  expect(screen.getByText("7채널")).toBeInTheDocument();
  expect(screen.getByText("엘프")).toBeInTheDocument();
  expect(screen.queryByText("길드")).not.toBeInTheDocument();
  expect(screen.getByLabelText("RGB 10.20.30")).toHaveStyle({
    backgroundColor: "rgb(10, 20, 30)",
  });
});

it("현재 미인증이어도 기존 인증 횟수를 함께 표시한다", () => {
  render(
    <PublicProfileHeader
      profile={{
        userId: 7,
        nickname: "누르",
        profileImageUrl: null,
        serverName: null,
        verified: false,
        activityGrade: "EXPERT",
        verificationCount: 3,
        mainChannel: null,
        guildName: null,
        race: null,
        arcana: null,
        preferredColors: [],
        mbti: null,
        bio: null,
      }}
    />,
  );
  expect(screen.getByText("인게임 미인증 · 인증 3회")).toBeInTheDocument();
  expect(screen.queryByLabelText("활동 등급: 달인")).not.toBeInTheDocument();
});

it("인증 이력이 없으면 0회 문구를 숨기고 긴 이름과 소개는 보존한다", () => {
  const nickname = "긴이름을가진밀레시안의프로필입니다";
  const bio = "여러 줄의 소개\n함께 에린을 여행해요.";
  render(
    <PublicProfileHeader
      profile={{
        userId: 7,
        nickname,
        profileImageUrl: null,
        serverName: null,
        verified: false,
        verificationCount: 0,
        mainChannel: 8,
        guildName: "에린 모험가",
        race: null,
        arcana: null,
        preferredColors: [],
        mbti: null,
        bio,
      }}
    />,
  );
  expect(screen.getByRole("heading", { name: nickname })).toBeInTheDocument();
  expect(screen.getByText("인게임 미인증")).toBeInTheDocument();
  expect(screen.queryByText(/0회/)).not.toBeInTheDocument();
  expect(
    screen.getByText("여러 줄의 소개 함께 에린을 여행해요.").textContent,
  ).toBe(bio);
  expect(screen.getByText("8채널")).toBeInTheDocument();
  expect(screen.getByText("에린 모험가")).toBeInTheDocument();
});
