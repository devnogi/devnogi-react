import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
};

export default function VerifiedBadge({ size = "sm", className = "" }: VerifiedBadgeProps) {
  return (
    <span title="인증된 사용자" className={`inline-flex items-center ${className}`}>
      <BadgeCheck className={`${sizeMap[size]} text-blue-500`} />
    </span>
  );
}
