import type { Metadata } from "next";

import { PRIVACY_POLICY } from "@/components/page/auth/TermsOfService";
import LegalDocument from "@/components/seo/LegalDocument";
import { createPageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = createPageMetadata({
  title: "개인정보처리방침",
  description: "메모노기 개인정보처리방침입니다.",
  pathname: "/privacy",
});

export default function PrivacyPage() {
  return <LegalDocument title="개인정보처리방침" content={PRIVACY_POLICY} />;
}
