import { notFound } from "next/navigation";

import GuildHome from "@/components/page/guilds/GuildHome";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id)) notFound();
  return <GuildHome key={id} id={id} />;
}
