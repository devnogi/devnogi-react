"use client";

import clsx from "clsx";
import { ShoppingCart, MessageSquare, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const navItems = [
  {
    href: "/auction-history",
    label: "거래 내역",
    icon: ShoppingCart,
    description: "경매장 거래",
  },
  {
    href: "/community",
    label: "커뮤니티",
    icon: MessageSquare,
    description: "게시판",
  },
  {
    href: "/mypage",
    label: "마이페이지",
    icon: UserCircle,
    description: "내 정보",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-8 fixed left-0 top-0 h-screen z-50">
      {/* Logo */}
      <Link href="/" className="mb-4 group">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-110 group-hover:shadow-xl">
          <Image
            src="/images/icons/icon-96x96.png"
            alt="DevNogi"
            width={32}
            height={32}
            className="rounded-lg"
            priority
          />
        </div>
      </Link>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-4">
        {navItems.map(({ href, label, icon: Icon, description }) => {
          const active = pathname === href || pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              title={description}
              className={clsx(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 relative group",
                active
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-105"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:scale-105",
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={2} />

              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                {label}
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
              </div>

              {/* Active Indicator */}
              {active && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile / Login */}
      <Link
        href="/sign-in"
        className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all duration-200 hover:scale-110"
        aria-label="로그인"
      >
        <UserCircle className="w-6 h-6 text-gray-700" />
      </Link>
    </aside>
  );
}
