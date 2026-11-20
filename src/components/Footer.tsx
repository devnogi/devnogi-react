import Link from "next/link";
const footerLinks = [
  { label: "이용약관", href: "/terms" },
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "문의", href: "/contact" },
];
export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 transition-colors dark:border-navy-600 dark:bg-navy-800">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center md:px-6 md:py-10">
        <span
          className="text-lg font-bold text-gray-900 dark:text-white"
          style={{ fontFamily: "'Bungee', cursive" }}
        >
          MEMONOGI
        </span>
        <p className="max-w-2xl text-xs leading-5 text-gray-600 dark:text-gray-300">
          메모노기는 공식 사이트가 아닙니다. 경매장 정보는 NEXON Open API를
          기반으로 제공합니다.
          <br />
          게임 내 실제 정보와 차이가 있을 수 있으므로 거래 전에는 게임에서 다시
          확인해 주세요.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-gray-600 transition-colors hover:text-gray-900 sm:text-sm dark:text-gray-300 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
