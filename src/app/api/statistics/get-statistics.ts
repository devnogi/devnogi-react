import { isAxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createServerAxios } from "@/lib/api/server";
import { weekEnd } from "@/lib/items/dates";

type Scope = "items" | "subcategories" | "top-categories";
type Period = "daily" | "weekly";

const number = z.number().finite();
const metrics = z.object({
  minPrice: number,
  maxPrice: number,
  avgPrice: number,
  totalVolume: number,
  totalQuantity: number,
});
const date = z.string().date();
const rows = z.array(z.record(z.unknown()));
const payload = z.union([
  rows,
  z
    .object({ success: z.literal(true), data: rows })
    .transform((response) => response.data),
]);

export async function getStatistics(
  request: NextRequest,
  endpoint: string,
  period: Period,
  scope: Scope,
) {
  const { searchParams } = request.nextUrl;
  const topCategory = searchParams.get("topCategory") ?? "";
  const subCategory = searchParams.get("subCategory") ?? "";
  const params = {
    topCategory,
    ...(scope !== "top-categories" && { subCategory }),
    ...(scope === "items" && { itemName: searchParams.get("itemName") ?? "" }),
    startDate: searchParams.get("dateFrom") ?? undefined,
    endDate: searchParams.get("dateTo") ?? undefined,
  };

  try {
    const { data, status } = await createServerAxios(request).get<unknown>(
      endpoint,
      { params },
    );
    const normalized = payload.parse(data).map((row) => {
      const values = metrics.parse(row);
      const start = date.parse(
        period === "daily" ? row.dateAuctionBuy : row.weekStartDate,
      );
      const dates =
        period === "daily"
          ? { date: start }
          : { weekStart: start, weekEnd: date.parse(weekEnd(start)) };
      if (scope === "items") {
        return {
          ...values,
          ...dates,
          itemName: z.string().parse(row.itemName),
          itemTopCategory: topCategory,
          itemSubCategory: subCategory,
          avgPrice:
            values.totalQuantity > 0
              ? number.parse(values.totalVolume / values.totalQuantity)
              : values.avgPrice,
        };
      }
      if (scope === "subcategories") {
        return {
          ...values,
          ...dates,
          topCategory,
          subCategory: z.string().parse(row.itemSubCategory),
        };
      }
      return {
        ...values,
        ...dates,
        topCategory: z.string().parse(row.itemTopCategory),
      };
    });
    return NextResponse.json(
      {
        success: true,
        code: "COMMON_SUCCESS",
        message: "요청이 성공적으로 처리되었습니다.",
        data: normalized,
      },
      { status },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "통계 응답을 확인할 수 없습니다." },
        { status: 502 },
      );
    }
    if (isAxiosError(error)) {
      return NextResponse.json(
        error.response?.data ?? { message: error.message },
        { status: error.response?.status ?? 500 },
      );
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
