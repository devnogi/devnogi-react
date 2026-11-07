"use client";
import Link from "next/link";

import GuildFeed from "./GuildFeed";
import { type Guild, Notice, useGuildData } from "./shared";
export default function GuildDetail({
  id,
  entryId,
  kind,
}: {
  id: string;
  entryId: string;
  kind: "posts" | "recruitments";
}) {
  const guild = useGuildData<Guild>("guilds/" + id);
  if (!guild.data)
    return <Notice pending={guild.isPending} error={guild.error} />;
  return (
    <>
      <Link href={"/guilds/" + id}>{guild.data.name} 길드홈</Link>
      <GuildFeed
        base={"guilds/" + id}
        guild={guild.data}
        kind={kind}
        entryId={entryId}
      />
    </>
  );
}
