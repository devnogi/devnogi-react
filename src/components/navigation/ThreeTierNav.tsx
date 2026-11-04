"use client";

import clsx from "clsx";
import { ChevronDown, Home, Moon, Sun, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

type NavigationLink = {
  href: string;
  label: string;
};

const auctionLinks: NavigationLink[] = [
  { href: "/auction-history", label: "거래 내역" },
  { href: "/auction-realtime", label: "실시간 거래" },
  { href: "/statistics", label: "시세 정보" },
];

const encyclopediaLinks: NavigationLink[] = [
  { href: "/item-info", label: "아이템 도감" },
];

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ActiveIndicator() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#b9502b] dark:bg-orange-300"
    />
  );
}

function NavigationItem({
  href,
  label,
  pathname,
}: NavigationLink & { pathname: string }) {
  const isActive = isCurrentPath(pathname, href);

  return (
    <Link
      href={href}
      className={clsx(
        "relative flex h-16 shrink-0 items-center px-2.5 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#b9502b] sm:px-3",
        isActive
          ? "text-[#a63f20] dark:text-orange-300"
          : "text-gray-600 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
      {isActive ? <ActiveIndicator /> : null}
    </Link>
  );
}

function NavigationDropdown({
  label,
  links,
  pathname,
}: {
  label: string;
  links: NavigationLink[];
  pathname: string;
}) {
  const isActive = links.some(({ href }) => isCurrentPath(pathname, href));

  return (
    <div className="group relative shrink-0">
      <button
        type="button"
        className={clsx(
          "relative flex h-16 items-center gap-1 px-2.5 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#b9502b] sm:px-3",
          isActive
            ? "text-[#a63f20] dark:text-orange-300"
            : "text-gray-600 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white",
        )}
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className="h-3.5 w-3.5 transition-transform duration-150 group-hover:rotate-180 group-focus-within:rotate-180"
        />
        {isActive ? <ActiveIndicator /> : null}
      </button>

      <div className="pointer-events-none invisible fixed top-16 left-4 z-50 w-48 translate-y-1 pt-2 opacity-0 transition-[opacity,transform,visibility] duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 md:absolute md:top-full md:left-1/2 md:w-44 md:-translate-x-1/2">
        <div
          role="group"
          aria-label={`${label} 메뉴`}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-[0_14px_34px_rgba(61,56,47,0.16)] dark:border-navy-600 dark:bg-navy-700 dark:shadow-[0_14px_34px_rgba(0,0,0,0.34)]"
        >
          {links.map(({ href, label: itemLabel }) => {
            const isItemActive = isCurrentPath(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex min-h-10 items-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#b9502b]",
                  isItemActive
                    ? "bg-orange-50 text-[#a63f20] dark:bg-orange-500/15 dark:text-orange-300"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-200 dark:hover:bg-navy-600 dark:hover:text-white",
                )}
                aria-current={isItemActive ? "page" : undefined}
              >
                {itemLabel}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ThreeTierNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md transition-colors dark:border-navy-600 dark:bg-navy-800/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 md:gap-4 md:px-6">
        <Link
          href="/"
          className="shrink-0 text-[17px] font-bold tracking-[-0.02em] text-gray-950 transition-colors hover:text-[#a63f20] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b9502b] sm:text-xl dark:text-white dark:hover:text-orange-300"
          style={{ fontFamily: "'Bungee', cursive" }}
        >
          MEMONOGI
        </Link>

        <nav
          aria-label="주요 메뉴"
          className="flex min-w-0 flex-1 items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:overflow-visible"
        >
          <Link
            href="/"
            aria-label="메인"
            aria-current={pathname === "/" ? "page" : undefined}
            className={clsx(
              "relative flex h-16 w-11 shrink-0 items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#b9502b]",
              pathname === "/"
                ? "text-[#a63f20] dark:text-orange-300"
                : "text-gray-600 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white",
            )}
          >
            <Home aria-hidden="true" className="h-[18px] w-[18px]" />
            {pathname === "/" ? <ActiveIndicator /> : null}
          </Link>
          <NavigationItem
            href="/community"
            label="커뮤니티"
            pathname={pathname}
          />
          <NavigationDropdown
            label="경매장"
            links={auctionLinks}
            pathname={pathname}
          />
          <NavigationItem
            href="/horn-bugle"
            label="뿔피리"
            pathname={pathname}
          />
          <NavigationDropdown
            label="도감"
            links={encyclopediaLinks}
            pathname={pathname}
          />
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9502b] dark:text-gray-200 dark:hover:bg-navy-600 dark:hover:text-white"
            aria-label={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
            onClick={toggleTheme}
          >
            {isDarkMode ? (
              <Moon aria-hidden="true" className="h-5 w-5 text-orange-300" />
            ) : (
              <Sun aria-hidden="true" className="h-5 w-5" />
            )}
          </button>

          {isAuthenticated ? (
            <Link
              href="/mypage"
              className="flex h-10 items-center gap-2 rounded-xl px-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9502b] dark:text-gray-200 dark:hover:bg-navy-600 dark:hover:text-white"
              aria-label="마이페이지"
            >
              <User aria-hidden="true" className="h-5 w-5" />
              <span className="hidden max-w-24 truncate lg:inline">
                {user?.nickname}
              </span>
              {user?.verified === true ? <VerifiedBadge size="sm" /> : null}
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="inline-flex h-9 items-center rounded-lg bg-[#b9502b] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#9a3f22] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9502b]"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
