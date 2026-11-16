import { NextRequest } from "next/server";

import { STATISTICS_DAILY_TOP_CATEGORIES_ENDPOINT } from "@/lib/api/constants";

import { getStatistics } from "../../get-statistics";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export function GET(request: NextRequest) {
  return getStatistics(
    request,
    STATISTICS_DAILY_TOP_CATEGORIES_ENDPOINT,
    "daily",
    "top-categories",
  );
}
