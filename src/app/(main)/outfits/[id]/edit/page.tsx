import { notFound } from "next/navigation";

import OutfitDetail from "@/components/page/outfits/OutfitDetail";
export const metadata = {
  title: "의장 수정",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id < 1) notFound();
  return <OutfitDetail id={id} editing />;
}
