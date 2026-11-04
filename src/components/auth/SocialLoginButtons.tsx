"use client";

import clsx from "clsx";

import { useConfig } from "@/contexts/ConfigContext";
import { type SocialProvider } from "@/lib/auth/socialAuth";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const KakaoIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
    <path
      fill="#3C1E1E"
      d="M12 3C6.486 3 2 6.462 2 10.8c0 2.775 1.858 5.21 4.665 6.563l-.892 3.245a.5.5 0 00.725.579l3.996-2.664A11.97 11.97 0 0012 18.6c5.514 0 10-3.462 10-7.8S17.514 3 12 3z"
    />
  </svg>
);

const NaverIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
    <path
      fill="#03C75A"
      d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"
    />
  </svg>
);

const providers: Array<{
  provider: SocialProvider;
  label: string;
  icon: React.ReactNode;
  className: string;
  labelClassName: string;
}> = [
  {
    provider: "google",
    label: "Google로 계속하기",
    icon: <GoogleIcon />,
    className: "border border-border hover:bg-background",
    labelClassName: "text-muted-foreground group-hover:text-foreground",
  },
  {
    provider: "kakao",
    label: "카카오로 계속하기",
    icon: <KakaoIcon />,
    className: "bg-[#FEE500] hover:bg-[#FDD835]",
    labelClassName: "text-[#3C1E1E] group-hover:text-black",
  },
  {
    provider: "naver",
    label: "네이버로 계속하기",
    icon: <NaverIcon />,
    className: "bg-[#03C75A] hover:bg-[#02B350]",
    labelClassName: "text-white",
  },
];

export function SocialLoginButtons() {
  const { config, isLoading } = useConfig();

  const startSocialLogin = (provider: SocialProvider) => {
    if (!config) return;
    void import("@/lib/auth/socialAuth").then(({ initiateSocialLogin }) => {
      initiateSocialLogin(provider, config.socialAuthBaseUrl);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {providers.map(({ provider, label, icon, className, labelClassName }) => (
        <button
          key={provider}
          type="button"
          onClick={() => startSocialLogin(provider)}
          disabled={isLoading || !config}
          className={clsx(
            "group flex h-12 w-full items-center justify-center gap-3 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          {icon}
          <span className={clsx("text-sm font-medium", labelClassName)}>
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}
