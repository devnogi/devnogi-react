const SERVER_CODES: Record<string, string> = {
  류트: "LT",
  만돌린: "MD",
  하프: "HP",
  울프: "WF",
};

interface ServerCodeBadgeProps {
  serverName?: string | null;
  verified?: boolean;
  className?: string;
}

export default function ServerCodeBadge({
  serverName,
  verified = false,
  className = "",
}: ServerCodeBadgeProps) {
  const code = serverName ? SERVER_CODES[serverName] : undefined;
  if (!verified || !code) return null;

  return (
    <span
      aria-label={`${serverName} 서버`}
      className={`inline-flex h-5 shrink-0 items-center rounded border border-border bg-muted px-1.5 text-[11px] leading-none font-semibold tracking-[0.02em] text-muted-foreground ${className}`}
    >
      {code}
    </span>
  );
}
