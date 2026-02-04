"use client";

import { useState, useCallback, useEffect } from "react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Search, X } from "lucide-react";

const navItems = [
  { href: "/auction-history", label: "경매장 거래내역", ready: true },
  { href: "#", label: "경매장 실시간 정보", ready: false },
  { href: "#", label: "시세 정보", ready: false },
  { href: "#", label: "거대한 뿔피리", ready: false },
  { href: "/community", label: "게시판", ready: true },
];

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isCommunityPage = pathname.startsWith("/community");
  const urlKeyword = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(isCommunityPage ? urlKeyword : "");

  // URL의 검색어가 변경되면 input 동기화
  useEffect(() => {
    if (isCommunityPage) {
      setSearchInput(urlKeyword);
    } else {
      setSearchInput("");
    }
  }, [isCommunityPage, urlKeyword]);

  const handleNotReady = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    toast("죄송합니다. 해당 메뉴는 오픈 준비 중입니다", {
      description: "빠른 시일 내에 준비하겠습니다!",
    });
  };

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedInput = searchInput.trim();

      if (isCommunityPage) {
        // 게시판 페이지에서는 검색어를 URL 파라미터로 전달
        if (trimmedInput) {
          router.push(`/community?q=${encodeURIComponent(trimmedInput)}`);
        } else {
          router.push("/community");
        }
      } else {
        // 다른 페이지에서는 게시판 페이지로 이동 후 검색
        if (trimmedInput) {
          router.push(`/community?q=${encodeURIComponent(trimmedInput)}`);
        }
      }
    },
    [searchInput, isCommunityPage, router]
  );

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    if (isCommunityPage) {
      router.push("/community");
    }
  }, [isCommunityPage, router]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-navy-800 border-b border-gray-200 dark:border-navy-700 h-16 hidden md:flex">
      <div className="flex items-center h-full w-full max-w-7xl mx-auto px-6 gap-6">
        {/* Logo */}
        <Link
          href="/"
          className="font-bold text-xl text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-shrink-0"
        >
          DevNogi
        </Link>

        {/* Navigation Menu */}
        <div className="flex items-center gap-1">
          {navItems.map(({ href, label, ready }) => {
            const isActive =
              ready &&
              (pathname === href || pathname.startsWith(href + "/"));

            return (
              <Link
                key={label}
                href={href}
                onClick={!ready ? handleNotReady : undefined}
                className={clsx(
                  "relative px-4 py-5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
                )}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={isCommunityPage ? "게시글 검색..." : "게시판 검색..."}
              className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 dark:border-navy-600 rounded-xl bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </nav>
  );
}
