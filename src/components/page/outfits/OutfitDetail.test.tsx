import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import type { Outfit } from "@/types/outfits";

import OutfitDetail from "./OutfitDetail";

const imageProps = jest.fn();
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: {
    alt: string;
    className?: string;
    unoptimized?: boolean;
  }) => {
    imageProps(props);
    return <span role="img" aria-label={props.alt} />;
  },
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null, isAuthenticated: false }),
}));
jest.mock("@/lib/outfits/api", () => ({ outfitRequest: jest.fn() }));
jest.mock("./OutfitAuth", () => ({
  OutfitAuth: ({ children }: { children: ReactNode }) => children,
}));
jest.mock("./OutfitActions", () => ({ __esModule: true, default: () => null }));
jest.mock("./OutfitComments", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("./OutfitComposer", () => ({
  __esModule: true,
  default: () => null,
}));

const outfit: Outfit = {
  id: 1,
  userId: 7,
  author: {
    nickname: "작성자",
    profileImageUrl: null,
    serverName: null,
    verified: true,
    activityGrade: "GRANDMASTER",
  },
  content: "",
  images: [{ id: 10, url: "/photo.png", displayOrder: 0 }],
  items: [],
  tags: [],
  likeCount: 0,
  commentCount: 0,
  shareCount: 0,
  createdAt: "2026-11-09T00:00:00Z",
  updatedAt: "2026-11-09T00:00:00Z",
};

it("renders the detail photo from the original endpoint without optimization", () => {
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { refetchOnMount: false } },
        })
      }
    >
      <OutfitDetail id={1} initial={outfit} />
    </QueryClientProvider>,
  );

  expect(
    screen.getByRole("img", { name: "작성자의 의장 #1 사진 1" }),
  ).toBeVisible();
  expect(screen.getByLabelText("활동 등급: 그랜드마스터")).toBeInTheDocument();
  expect(imageProps.mock.calls[0][0]).toMatchObject({
    src: "/api/outfits/1/images/10",
    unoptimized: true,
    className: "object-cover",
  });
});
