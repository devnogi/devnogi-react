"use client";

import clsx from "clsx";
import { ShoppingCart, MessageSquare, UserCircle, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    label: "마이",
    icon: UserCircle,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200",
                active
                  ? "text-blue-600"
                  : "text-gray-400 hover:text-gray-700",
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
              <span className={clsx(
                "text-xs font-medium",
                active ? "text-blue-600" : "text-gray-600"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
