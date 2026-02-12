import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import {
  AUCTION_HISTORY_BATCH_ENDPOINT,
  HORN_BUGLE_BATCH_ENDPOINT,
  ITEM_INFO_SYNC_ENDPOINT,
  METALWARE_ATTRIBUTE_SYNC_ENDPOINT,
  METALWARE_INFO_SYNC_ENDPOINT,
  USER_ENDPOINT,
} from "@/lib/api/constants";
import { createAuthServerAxios, createServerAxios } from "@/lib/api/server";
import { isAdminRole, normalizeRole } from "@/utils/roles";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TASK_CONFIG = {
  "auction-history-batch": {
    endpoint: AUCTION_HISTORY_BATCH_ENDPOINT,
    label: "경매장 거래내역 배치",
    successMessage: "경매장 거래내역 배치가 실행되었습니다.",
  },
  "horn-bugle-batch": {
    endpoint: HORN_BUGLE_BATCH_ENDPOINT,
    label: "거대한 뿔피리 배치",
    successMessage: "거대한 뿔피리 배치가 실행되었습니다.",
  },
  "item-info-sync": {
    endpoint: ITEM_INFO_SYNC_ENDPOINT,
    label: "아이템 정보 동기화",
    successMessage: "아이템 정보 동기화가 실행되었습니다.",
  },
  "metalware-info-sync": {
    endpoint: METALWARE_INFO_SYNC_ENDPOINT,
    label: "금속 변환 아이템 정보 동기화",
    successMessage: "금속 변환 아이템 정보 동기화가 실행되었습니다.",
  },
  "metalware-attribute-sync": {
    endpoint: METALWARE_ATTRIBUTE_SYNC_ENDPOINT,
    label: "금속 변환 속성 정보 동기화",
    successMessage: "금속 변환 속성 정보 동기화가 실행되었습니다.",
  },
} as const;

type TaskKey = keyof typeof TASK_CONFIG;

function buildUnknownTaskResponse(task: string) {
  return NextResponse.json(
    {
      success: false,
      code: "UNKNOWN_ADMIN_TASK",
      message: `지원하지 않는 작업입니다: ${task}`,
    },
    { status: 404 }
  );
}

type TaskRouteContext = {
  params: Promise<{ task: string }>;
};

export async function POST(
  request: NextRequest,
  { params }: TaskRouteContext
) {
  const { task } = await params;
  const taskConfig = TASK_CONFIG[task as TaskKey];

  if (!taskConfig) {
    return buildUnknownTaskResponse(task);
  }

  try {
    const authAxios = createAuthServerAxios(request);
    const userResponse = await authAxios.get(`${USER_ENDPOINT}/info`);
    const role =
      userResponse.data?.data?.role ?? userResponse.data?.role ?? "";
    const normalizedRole = normalizeRole(role);

    if (!isAdminRole(normalizedRole)) {
      return NextResponse.json(
        {
          success: false,
          code: "ACCESS_DENIED",
          message: "관리자 전용 작업입니다.",
        },
        { status: 403 }
      );
    }

    const serverAxios = createServerAxios(request);
    const response = await serverAxios.post(taskConfig.endpoint);

    return NextResponse.json(
      {
        success: true,
        code: "ADMIN_TASK_EXECUTED",
        message: taskConfig.successMessage,
        data: response.data ?? null,
        task,
      },
      { status: response.status ?? 200 }
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const responseData = error.response?.data ?? null;
      const message =
        responseData?.message ||
        error.message ||
        `${TASK_CONFIG[task as TaskKey]?.label ?? "작업"} 실행에 실패했습니다.`;

      return NextResponse.json(
        {
          success: false,
          code: "ADMIN_TASK_FAILED",
          message,
          data: responseData,
          task,
        },
        { status }
      );
    }

    const fallbackMessage =
      error instanceof Error
        ? error.message
        : "알 수 없는 오류가 발생했습니다.";

    return NextResponse.json(
      {
        success: false,
        code: "ADMIN_TASK_ERROR",
        message: fallbackMessage,
        task,
      },
      { status: 500 }
    );
  }
}

