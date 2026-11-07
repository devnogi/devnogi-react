import { notFound } from "next/navigation";

import GuildDetail from "@/components/page/guilds/GuildDetail";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string; kind: string; entryId: string }>;
}) {
  const { id, kind, entryId } = await params;
  if (
    !/^[1-9]\d*$/.test(id) ||
    !/^[1-9]\d*$/.test(entryId) ||
    (kind !== "posts" && kind !== "recruitments")
  )
    notFound();
  return <GuildDetail id={id} kind={kind} entryId={entryId} />;
}
