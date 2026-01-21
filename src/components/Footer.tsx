"use client";

import Link from "next/link";
import { toast } from "sonner";

export default function Footer() {
  const handleNotReady = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    toast("죄송합니다. 해당 메뉴는 오픈 준비 중입니다", {
      description: "빠른 시일 내에 준비하겠습니다!",
    });
  };

  const footerLinks = [
    { label: "이용약관", href: "#" },
    { label: "개인정보처리방침", href: "#" },
    { label: "문의", href: "#" },
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
        {/* Desktop/Tablet Layout */}
        <div className="hidden sm:flex sm:flex-col sm:items-center sm:gap-4">
          {/* Site name and disclaimer */}
          <div className="flex items-center gap-3">
            <span
              className="font-bold text-lg text-gray-900"
              style={{ fontFamily: "'Bungee', cursive" }}
            >
              MEMONOGI
            </span>
            <span className="text-sm text-gray-500">|</span>
            <span className="text-sm text-gray-500">공식 사이트 아님</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            {footerLinks.map((link, index) => (
              <div key={link.label} className="flex items-center gap-4">
                <Link
                  href={link.href}
                  onClick={handleNotReady}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </Link>
                {index < footerLinks.length - 1 && (
                  <span className="text-gray-300">·</span>
                )}
              </div>
            ))}
          </div>

          {/* Data source */}
          <p className="text-xs text-gray-400 text-center">
            Data provided by NEXON Open API
          </p>
        </div>

        {/* Mobile Layout */}
        <div className="flex flex-col items-center gap-4 sm:hidden">
          {/* Site name */}
          <span
            className="font-bold text-lg text-gray-900"
            style={{ fontFamily: "'Bungee', cursive" }}
          >
            MEMONOGI
          </span>

          {/* Disclaimer */}
          <span className="text-xs text-gray-500">공식 사이트 아님</span>

          {/* Links */}
          <div className="flex items-center gap-3">
            {footerLinks.map((link, index) => (
              <div key={link.label} className="flex items-center gap-3">
                <Link
                  href={link.href}
                  onClick={handleNotReady}
                  className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </Link>
                {index < footerLinks.length - 1 && (
                  <span className="text-gray-300">·</span>
                )}
              </div>
            ))}
          </div>

          {/* Data source */}
          <p className="text-xs text-gray-400 text-center">
            Data provided by NEXON Open API
          </p>
        </div>
      </div>
    </footer>
  );
}
