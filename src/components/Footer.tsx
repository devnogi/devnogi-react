import Link from "next/link";

const footerLinks = [
  { label: "이용약관", href: "/terms" },
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "문의", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-navy-800 border-t border-gray-200 dark:border-navy-600 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="hidden sm:flex sm:flex-col sm:items-center sm:gap-4">
          <div className="flex items-center gap-3">
            <span
              className="font-bold text-lg text-gray-900 dark:text-white"
              style={{ fontFamily: "'Bungee', cursive" }}
            >
              MEMONOGI
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">|</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              공식 사이트 아님
            </span>
          </div>

          <FooterLinks
            className="gap-4"
            separatorClassName="text-gray-300 dark:text-gray-600"
            linkClassName="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          />

          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Data provided by NEXON Open API
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:hidden">
          <span
            className="font-bold text-lg text-gray-900 dark:text-white"
            style={{ fontFamily: "'Bungee', cursive" }}
          >
            MEMONOGI
          </span>

          <span className="text-xs text-gray-500 dark:text-gray-400">
            공식 사이트 아님
          </span>

          <FooterLinks
            className="gap-3"
            separatorClassName="text-gray-300 dark:text-gray-600"
            linkClassName="text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          />

          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Data provided by NEXON Open API
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({
  className,
  separatorClassName,
  linkClassName,
}: {
  className: string;
  separatorClassName: string;
  linkClassName: string;
}) {
  return (
    <div className={`flex items-center ${className}`}>
      {footerLinks.map((link, index) => (
        <div key={link.label} className={`flex items-center ${className}`}>
          <Link href={link.href} className={linkClassName}>
            {link.label}
          </Link>
          {index < footerLinks.length - 1 && (
            <span className={separatorClassName}>·</span>
          )}
        </div>
      ))}
    </div>
  );
}
