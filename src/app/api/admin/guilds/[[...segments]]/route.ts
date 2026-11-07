import { NextRequest } from "next/server";

import { proxyGuild } from "@/lib/guilds/proxy";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ segments?: string[] }> };

async function handle(request: NextRequest, context: Context) {
  return proxyGuild(request, (await context.params).segments ?? [], true);
}

export {
  handle as DELETE,
  handle as GET,
  handle as PATCH,
  handle as POST,
  handle as PUT,
};
