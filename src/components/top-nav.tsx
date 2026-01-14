"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

const navItems = [
  { href: "/auction-history", label: "경매장 거래내역", ready: true },
  { href: "#", label: "경매장 실시간 정보", ready: false },
  { href: "#", label: "시세 정보", ready: false },
  { href: "#", label: "거대한 뿔피리", ready: false },
  { href: "/community", label: "게시판", ready: true },
];

export default function TopNav() {
  const pathname = usePathname();

  const handleNotReady = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    toast("죄송합니다. 해당 메뉴는 오픈 준비 중입니다", {
      description: "빠른 시일 내에 준비하겠습니다!",
    });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 hidden md:flex">
      <div className="flex items-center h-full w-full max-w-7xl mx-auto px-6 gap-8">
        {/* Logo */}
        <Link
          href="/"
          className="font-bold text-xl text-gray-900 hover:text-blue-600 transition-colors flex-shrink-0"
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
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
