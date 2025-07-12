import { Italic, Menu, User } from "lucide-react";
import Link from "next/link";

function NavBar() {
  return (
    <nav className="w-full grid grid-cols-[64px_1fr_64px] px-2 sm:px-4 py-2 h-12">
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
      <div className="sm:flex hidden items-center justify-start md:gap-4 gap-2">
        <Link
          href="/auction-history"
          className="hover:bg-gray-200 px-2 py-1 rounded"
        >
          거래 내역
        </Link>
        <Link href="/auction" className="hover:bg-gray-200 px-2 py-1 rounded">
          경매장
        </Link>
        <Link
          href="/ui-preview/error-test"
          className="hover:bg-gray-200 px-2 py-1 rounded"
        >
          오류페이지 프리뷰
        </Link>
      </div>
      <div className="flex items-center justify-self-end">
        <Link href="/sign-in">
          <User className="w-6 h-6" />
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;
