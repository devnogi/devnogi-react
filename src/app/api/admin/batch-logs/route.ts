import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import {
  BATCH_LOGS_ENDPOINT,
  BATCH_LOGS_LATEST_ENDPOINT,
  USER_ENDPOINT,
} from "@/lib/api/constants";
import { createAuthServerAxios, createServerAxios } from "@/lib/api/server";
import { isAdminRole, normalizeRole } from "@/utils/roles";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BATCH_TYPE_SET = new Set([
  "AUCTION_HISTORY_BATCH",
  "ITEM_INFO_SYNC",
  "METALWARE_ATTRIBUTE_SYNC",
]);

function parsePositiveInt(
  raw: string | null,
  fallback: number,
  min: number,
  max: number
): number {
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) return fallback;
  if (parsed < min) return min;
  if (parsed > max) return max;
  return parsed;
}

function parseLatestFlag(value: string | null): boolean {
  if (!value) return false;
  return value.toLowerCase() === "true";
}

function buildForbiddenResponse() {
  return NextResponse.json(
    {
      success: false,
      code: "ACCESS_DENIED",
      message: "관리자 전용 조회 API입니다.",
    },
    { status: 403 }
  );
}

export async function GET(request: NextRequest) {
  try {
    const authAxios = createAuthServerAxios(request);
    const userResponse = await authAxios.get(`${USER_ENDPOINT}/info`);
    const role = userResponse.data?.data?.role ?? userResponse.data?.role ?? "";
    const normalizedRole = normalizeRole(role);

    if (!isAdminRole(normalizedRole)) {
      return buildForbiddenResponse();
    }

    const url = new URL(request.url);
    const isLatest = parseLatestFlag(url.searchParams.get("latest"));
    const batchType = url.searchParams.get("batchType")?.trim() ?? "";
    const page = parsePositiveInt(url.searchParams.get("page"), 1, 1, 10000);
    const size = parsePositiveInt(url.searchParams.get("size"), 20, 10, 50);

    const serverAxios = createServerAxios(request);

    if (isLatest) {
      const latestResponse = await serverAxios.get(BATCH_LOGS_LATEST_ENDPOINT);
      return NextResponse.json(
        {
          success: true,
          code: "BATCH_LATEST_LOGS_FETCHED",
          data: latestResponse.data ?? [],
        },
        { status: latestResponse.status ?? 200 }
      );
    }

    if (!BATCH_TYPE_SET.has(batchType)) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_BATCH_TYPE",
          message:
            "batchType은 AUCTION_HISTORY_BATCH, ITEM_INFO_SYNC, METALWARE_ATTRIBUTE_SYNC 중 하나여야 합니다.",
        },
        { status: 400 }
      );
    }

    const listResponse = await serverAxios.get(BATCH_LOGS_ENDPOINT, {
      params: {
        batchType,
        page,
        size,
      },
    });

    return NextResponse.json(
      {
        success: true,
        code: "BATCH_LOGS_FETCHED",
        data: listResponse.data,
      },
      { status: listResponse.status ?? 200 }
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const responseData = error.response?.data ?? null;
      const message =
        responseData?.message ??
        error.message ??
        "배치 로그 조회 중 오류가 발생했습니다.";

      return NextResponse.json(
        {
          success: false,
          code: "BATCH_LOGS_FETCH_FAILED",
          message,
          data: responseData,
        },
        { status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        code: "BATCH_LOGS_FETCH_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
