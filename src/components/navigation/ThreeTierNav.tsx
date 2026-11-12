"use client";

import clsx from "clsx";
import { ChevronDown, Home, Moon, Sun, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { isAdminRole } from "@/utils/roles";

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
      className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary"
    />
  );
}

function NavigationItem({
  href,
  label,
  pathname,
  prefetch,
}: NavigationLink & { pathname: string; prefetch?: boolean }) {
  const isActive = isCurrentPath(pathname, href);

  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={clsx(
        "relative flex h-12 md:h-16 shrink-0 items-center min-w-11 justify-center px-2 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-ring sm:px-3",
        isActive
          ? "text-primary"
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
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-expanded={isOpen}
          className={clsx(
            "relative flex h-12 shrink-0 md:h-16 items-center gap-1 min-w-11 justify-center px-2 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-ring sm:px-3",
            isActive
              ? "text-primary"
              : "text-gray-600 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white",
          )}
        >
          {label}
          <ChevronDown
            aria-hidden="true"
            className={clsx(
              "h-3.5 w-3.5 transition-transform duration-150",
              isOpen && "rotate-180",
            )}
          />
          {isActive ? <ActiveIndicator /> : null}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={8}
        collisionPadding={16}
        aria-label={`${label} 메뉴`}
        className="w-48 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-[0_14px_34px_rgba(61,56,47,0.16)] md:w-44 dark:border-navy-600 dark:bg-navy-700 dark:shadow-[0_14px_34px_rgba(0,0,0,0.34)]"
      >
        <div role="group" aria-label={`${label} 메뉴`}>
          {links.map(({ href, label: itemLabel }) => {
            const isItemActive = isCurrentPath(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
                  isItemActive
                    ? "bg-[var(--color-ds-primary-50)] text-primary"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-200 dark:hover:bg-navy-600 dark:hover:text-white",
                )}
                aria-current={isItemActive ? "page" : undefined}
              >
                {itemLabel}
              </Link>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function ThreeTierNav() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();
  const isAdminUser = isAdminRole(user?.role);
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md transition-colors dark:border-navy-600 dark:bg-navy-800/95">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-x-2 px-4 md:grid-cols-[auto_1fr_auto] md:gap-x-4 md:px-6">
        <Link
          href="/"
          className="flex h-16 items-center justify-self-start shrink-0 text-[17px] font-bold tracking-[-0.02em] text-gray-950 transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:text-xl dark:text-white "
          style={{ fontFamily: "'Bungee', cursive" }}
        >
          MEMONOGI
        </Link>

        <nav
          aria-label="주요 메뉴"
          className="col-span-2 row-start-2 flex h-12 min-w-0 items-center justify-between overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-t border-border md:overflow-visible md:col-span-1 md:col-start-2 md:row-start-1 md:h-16 md:justify-start md:border-0"
        >
          <Link
            href="/"
            aria-label="메인"
            aria-current={pathname === "/" ? "page" : undefined}
            className={clsx(
              "relative flex h-12 md:h-16 w-11 shrink-0 items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-ring",
              pathname === "/"
                ? "text-primary"
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
          {!isLoading && isAuthenticated ? (
            <NavigationItem
              href="/hero-auctions"
              label="광고 경매"
              pathname={pathname}
            />
          ) : null}
          <NavigationItem
            href="/guilds"
            label="길드"
            pathname={pathname}
            prefetch={false}
          />
          <NavigationItem href="/outfits" label="의장" pathname={pathname} />
          <NavigationDropdown
            key={`${pathname}-auction`}
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
            key={`${pathname}-encyclopedia`}
            label="도감"
            links={encyclopediaLinks}
            pathname={pathname}
          />
        </nav>

        <div className="col-start-2 row-start-1 ml-auto flex h-16 shrink-0 items-center gap-1.5 md:col-start-3">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:text-gray-200 dark:hover:bg-navy-600 dark:hover:text-white"
            aria-label={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
            onClick={toggleTheme}
          >
            {isDarkMode ? (
              <Moon aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Sun aria-hidden="true" className="h-5 w-5" />
            )}
          </button>

          {isAdminUser ? (
            <Link
              href="/admin"
              aria-current={
                isCurrentPath(pathname, "/admin") ? "page" : undefined
              }
              className="inline-flex h-11 items-center rounded-xl border border-primary/30 px-3 text-xs font-semibold text-primary transition-colors hover:bg-[var(--color-ds-primary-50)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              관리자
            </Link>
          ) : null}

          {isAuthenticated ? (
            <Link
              href="/mypage"
              className="flex h-11 items-center gap-2 rounded-xl px-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:text-gray-200 dark:hover:bg-navy-600 dark:hover:text-white"
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
              prefetch={false}
              className="inline-flex h-11 items-center rounded-lg bg-primary px-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[var(--color-ds-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
