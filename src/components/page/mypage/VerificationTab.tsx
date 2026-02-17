"use client";

import { useVerificationInfo } from "@/hooks/useUserVerification";
import VerificationStatusCard from "./VerificationStatusCard";
import VerificationTokenCard from "./VerificationTokenCard";
import VerificationInstructions from "./VerificationInstructions";
import VerificationHistoryList from "./VerificationHistoryList";

interface VerificationTabProps {
  userId: number | undefined;
}

export default function VerificationTab({ userId }: VerificationTabProps) {
  const { data: info, isLoading: isInfoLoading } = useVerificationInfo(!!userId);

  return (
    <div className="space-y-4">
      <VerificationStatusCard info={info} isLoading={isInfoLoading} />
      <VerificationTokenCard />
      <VerificationInstructions />
      <VerificationHistoryList enabled={!!userId} />
    </div>
  );
}
