"use client";

import clsx from "clsx";
import { ShoppingCart, MessageSquare, UserCircle, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const navItems = [
  {
    href: "/auction-history",
    label: "거래 내역",
    icon: ShoppingCart,
  },
  {
    href: "/community",
    label: "커뮤니티",
    icon: MessageSquare,
  },
  {
    href: "/notifications",
    label: "알림",
    icon: Bell,
  },
  {
    href: "/mypage",
    label: "마이페이지",
    icon: UserCircle,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 fixed left-0 top-0 h-screen z-50">
      {/* Logo */}
      <Link href="/" className="group">
        <div className="w-12 h-12 flex items-center justify-center transition-all duration-200 group-hover:scale-110">
          <Image
            src="/images/icons/icon-96x96.png"
            alt="DevNogi"
            width={48}
            height={48}
            className="rounded-xl"
            priority
          />
        </div>
      </Link>

      {/* Navigation Items - Centered */}
      <nav className="flex-1 flex flex-col gap-6 items-center justify-center">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              className={clsx(
                "w-12 h-12 flex items-center justify-center transition-all duration-200 relative group",
                active
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-700",
              )}
            >
              <Icon className="w-7 h-7" strokeWidth={active ? 2.5 : 2} />

              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                {label}
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
              </div>

              {/* Active Indicator */}
              {active && (
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-8 bg-gray-900 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
