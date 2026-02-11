import { STATISTICS_WEEKLY_ITEMS_ENDPOINT } from "@/lib/api/constants";
import { createServerAxios } from "@/lib/api/server";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = {
    itemName: searchParams.get("itemName") ?? "",
    subCategory: searchParams.get("subCategory") ?? "",
    topCategory: searchParams.get("topCategory") ?? "",
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
  };

  try {
    const axios = createServerAxios(request);
    const { data, status } = await axios.get(
      STATISTICS_WEEKLY_ITEMS_ENDPOINT,
      { params },
    );
    return NextResponse.json(data, { status });
  } catch (error: unknown) {
    if ((error as AxiosError).isAxiosError) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? 500;
      const payload = axiosError.response?.data ?? {
        message: axiosError.message,
      };
      return NextResponse.json(payload, { status });
    }

    const err = error instanceof Error ? error : new Error("Unknown error");
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
