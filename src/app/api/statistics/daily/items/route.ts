import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

import { STATISTICS_DAILY_ITEMS_ENDPOINT } from "@/lib/api/constants";
import { createServerAxios } from "@/lib/api/server";

export const dynamic = "force-dynamic";
export const revalidate = 300;

interface RawDailyStatistic {
  itemName: string;
  dateAuctionBuy: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  totalVolume: number;
  totalQuantity: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = {
    itemName: searchParams.get("itemName") ?? "",
    subCategory: searchParams.get("subCategory") ?? "",
    topCategory: searchParams.get("topCategory") ?? "",
    startDate: searchParams.get("dateFrom") ?? undefined,
    endDate: searchParams.get("dateTo") ?? undefined,
  };

  try {
    const axios = createServerAxios(request);
    const { data, status } = await axios.get<RawDailyStatistic[]>(
      STATISTICS_DAILY_ITEMS_ENDPOINT,
      {
        params,
      },
    );
    const normalized = data.map((item) => ({
      itemName: item.itemName,
      itemTopCategory: params.topCategory,
      itemSubCategory: params.subCategory,
      date: item.dateAuctionBuy,
      minPrice: item.minPrice,
      maxPrice: item.maxPrice,
      avgPrice:
        item.totalQuantity > 0
          ? item.totalVolume / item.totalQuantity
          : Number(item.avgPrice),
      totalVolume: item.totalVolume,
      totalQuantity: item.totalQuantity,
    }));
    return NextResponse.json(
      {
        success: true,
        code: "COMMON_SUCCESS",
        message: "요청이 성공적으로 처리되었습니다.",
        data: normalized,
      },
      { status },
    );
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
