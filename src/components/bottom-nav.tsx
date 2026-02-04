"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

const navItems = [
  { href: "/auction-history", label: "거래내역", ready: true },
  { href: "/community", label: "게시판", ready: true },
  { href: "/auction-realtime", label: "실시간", ready: true },
  { href: "/item-info", label: "아이템", ready: true },
  { href: "/horn-bugle", label: "뿔피리", ready: true },
];

export default function BottomNav() {
  const pathname = usePathname();

  const handleNotReady = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    toast("죄송합니다. 해당 메뉴는 오픈 준비 중입니다", {
      description: "빠른 시일 내에 준비하겠습니다!",
    });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-navy-800 border-t border-gray-200 dark:border-navy-700 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map(({ href, label, ready }) => {
          const isActive =
            ready &&
            (pathname === href || pathname.startsWith(href + "/"));

          return (
            <Link
              key={label}
              href={href}
              onClick={!ready ? handleNotReady : undefined}
              aria-current={isActive ? "page" : undefined}
              className={clsx(
                "relative flex items-center justify-center flex-1 h-full transition-all duration-200",
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
              )}
            >
              <span
                className={clsx(
                  "text-xs font-medium",
                  isActive && "font-semibold",
                )}
              >
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
