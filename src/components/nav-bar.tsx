import { Italic, Menu, User } from "lucide-react";
import Link from "next/link";

function NavBar() {
  return (
    <nav className="w-full grid grid-cols-[1fr_3fr_1fr] px-2 sm:px-4 py-2 h-12">
      <div className="sm:hidden flex items-center">
        <Link href="/">
          <Menu className="w-6 h-6" />
        </Link>
      </div>
      <div className="flex justify-self-center sm:justify-self-start items-center">
        <Link href="/">
          <Italic className="w-6 h-6" />
        </Link>
      </div>
      <div className="sm:flex hidden items-center justify-between md:gap-4 gap-2">
        <Link href="/" className="hover:bg-gray-200 px-2 py-1 rounded">
          홈
        </Link>
        <Link href="/posts" className="hover:bg-gray-200 px-2 py-1 rounded">
          게시글
        </Link>
        <Link href="/auction" className="hover:bg-gray-200 px-2 py-1 rounded">
          경매
        </Link>
        <Link href="/" className="hover:bg-gray-200 px-2 py-1 rounded">
          메뉴4
        </Link>
        <Link href="/" className="hover:bg-gray-200 px-2 py-1 rounded">
          메뉴5
        </Link>
      </div>
      <div className="flex items-center justify-self-end">
        <Link href="/">
          <User className="w-6 h-6" />
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;
