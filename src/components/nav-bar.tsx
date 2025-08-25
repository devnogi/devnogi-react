"use client";

import clsx from "clsx";
import { Menu, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/auction-history", label: "거래 내역" },
    { href: "/auction", label: "경매장" },
    { href: "/community", label: "커뮤니티" },
  ];

  return (
    <nav className="w-full grid grid-cols-[64px_1fr_64px] px-2 sm:px-4 py-2 h-12">
      <div className="sm:hidden flex items-center">
        <Link href="/">
          <Menu className="w-6 h-6" />
        </Link>
      </div>
      <div className="flex justify-self-center sm:justify-self-start items-center">
        <Link className="flex" href="/">
          <Image
            src="/images/icons/icon-96x96.png"
            alt="navbar logo"
            width={32}
            height={32}
            priority
          />
          <h1 className="sm:hidden ml-2 text-lg font-bold tracking-tight leading-none self-center">
            Devnogi
          </h1>
        </Link>
      </div>
      <div className="sm:flex hidden items-center justify-start md:gap-4 gap-2">
        {navItems.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "hover:bg-gray-300 px-2 py-1 rounded",
                active && "font-bold bg-gray-200",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
      <div className="flex items-center justify-self-end">
        <Link href="/sign-in">
          <User className="w-6 h-6" />
        </Link>
      </div>
    </nav>
  );
}
