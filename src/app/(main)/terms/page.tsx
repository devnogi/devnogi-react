import type { Metadata } from "next";

import { TERMS_OF_SERVICE } from "@/components/page/auth/TermsOfService";
import LegalDocument from "@/components/seo/LegalDocument";
import { createPageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = createPageMetadata({
  title: "이용약관",
  description: "메모노기 이용약관입니다.",
  pathname: "/terms",
});

export default function TermsPage() {
  return <LegalDocument title="이용약관" content={TERMS_OF_SERVICE} />;
}
