"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Activity,
  CalendarClock,
  DatabaseZap,
  Loader2,
  RefreshCcw,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { clientAxios } from "@/lib/api/clients";
import { isAdminRole, normalizeRole } from "@/utils/roles";
import { toast } from "sonner";

const ADMIN_TASKS = [
  {
    key: "auction-history-batch",
    title: "경매장 거래내역 배치",
    description: "경매장 거래내역 전 카테고리를 최신 시세로 적재합니다.",
    backendEndpoint: "POST /oab/auction-history/batch",
    category: "Batch",
    icon: RefreshCcw,
  },
  {
    key: "horn-bugle-batch",
    title: "거대한 뿔피리 배치",
    description: "모든 서버의 거대한 뿔피리 메시지를 수집합니다.",
    backendEndpoint: "POST /oab/horn-bugle/batch",
    category: "Batch",
    icon: Waves,
  },
  {
    key: "item-info-sync",
    title: "아이템 정보 동기화",
    description: "경매장 데이터 기준으로 ItemInfo 테이블을 동기화합니다.",
    backendEndpoint: "POST /oab/api/item-infos/sync",
    category: "Sync",
    icon: DatabaseZap,
  },
  {
    key: "metalware-info-sync",
    title: "금속 변환 아이템 동기화",
    description: "속성 정보를 기반으로 금속 변환 아이템 정보를 최신화합니다.",
    backendEndpoint: "POST /oab/api/metalware-infos/sync",
    category: "Sync",
    icon: ServerCog,
  },
  {
    key: "metalware-attribute-sync",
    title: "금속 변환 속성 동기화",
    description: "경매장 데이터를 사용해 금속 변환 속성 정의를 동기화합니다.",
    backendEndpoint: "POST /oab/api/metalware-attribute-infos/sync",
    category: "Sync",
    icon: Activity,
  },
  {
    key: "enchant-info-sync",
    title: "인챈트 정보 동기화",
    description: "auction_history_item_option을 기반으로 enchant_info를 업서트합니다.",
    backendEndpoint: "POST /oab/api/enchant-infos/sync",
    category: "Sync",
    icon: Sparkles,
  },
] as const;

const BATCH_TYPE_OPTIONS = [
  "AUCTION_HISTORY_BATCH",
  "ITEM_INFO_SYNC",
  "METALWARE_ATTRIBUTE_SYNC",
] as const;

type BatchType = (typeof BATCH_TYPE_OPTIONS)[number];

type BatchExecutionLog = {
  id: number;
  batchType: BatchType;
  triggerType: "AUTO" | "MANUAL";
  startedAt: string;
  completedAt?: string | null;
  isSuccess: boolean;
  recordCount: number;
  message?: string | null;
};

type PageMeta = {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
};

type BatchLogPageResponse = {
  items: BatchExecutionLog[];
  meta: PageMeta;
};

type AdminTaskKey = (typeof ADMIN_TASKS)[number]["key"];

type TaskState = {
  isRunning: boolean;
  lastRunAt?: string;
  lastStatus?: "success" | "error";
  statusCode?: number;
  message?: string;
  payload?: unknown;
};

type TaskStateMap = Record<AdminTaskKey, TaskState>;

const buildInitialTaskStates = (): TaskStateMap => {
  return ADMIN_TASKS.reduce((acc, task) => {
    acc[task.key] = { isRunning: false };
    return acc;
  }, {} as TaskStateMap);
};

function formatTimestamp(value?: string | null) {
  if (!value) return "-";
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  } catch {
    return value;
  }
}

function formatPayload(payload: unknown) {
  if (payload === undefined || payload === null) return null;
  try {
    const serialized = JSON.stringify(payload, null, 2);
    if (serialized.length > 1800) {
      return `${serialized.substring(0, 1800)}\n... (truncated)`;
    }
    return serialized;
  } catch {
    return String(payload);
  }
}

function formatBatchTypeLabel(batchType: BatchType) {
  switch (batchType) {
    case "AUCTION_HISTORY_BATCH":
      return "경매장 거래내역 배치";
    case "ITEM_INFO_SYNC":
      return "아이템 정보 동기화";
    case "METALWARE_ATTRIBUTE_SYNC":
      return "금속 변환 속성 동기화";
    default:
      return batchType;
  }
}

function formatTriggerTypeLabel(triggerType: BatchExecutionLog["triggerType"]) {
  return triggerType === "MANUAL" ? "수동" : "자동";
}

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const normalizedRole = normalizeRole(user?.role);
  const isAdminUser = isAdminRole(normalizedRole);

  const [taskStates, setTaskStates] = useState<TaskStateMap>(() => buildInitialTaskStates());

  const [latestLogs, setLatestLogs] = useState<BatchExecutionLog[]>([]);
  const [isLatestLoading, setIsLatestLoading] = useState(false);

  const [selectedBatchType, setSelectedBatchType] =
    useState<BatchType>("AUCTION_HISTORY_BATCH");
  const [batchPage, setBatchPage] = useState(1);
  const [batchLogs, setBatchLogs] = useState<BatchExecutionLog[]>([]);
  const [batchMeta, setBatchMeta] = useState<PageMeta | null>(null);
  const [isBatchLogLoading, setIsBatchLogLoading] = useState(false);
  const [batchLogError, setBatchLogError] = useState<string | null>(null);

  const pageState = useMemo(() => {
    if (isLoading) return "loading";
    if (!isAuthenticated) return "unauthenticated";
    if (!isAdminUser) return "forbidden";
    return "ready";
  }, [isLoading, isAuthenticated, isAdminUser]);

  const latestLogMap = useMemo(() => {
    return latestLogs.reduce((acc, log) => {
      acc[log.batchType] = log;
      return acc;
    }, {} as Partial<Record<BatchType, BatchExecutionLog>>);
  }, [latestLogs]);

  const fetchLatestLogs = useCallback(async () => {
    if (pageState !== "ready") return;

    setIsLatestLoading(true);
    try {
      const response = await clientAxios.get("/admin/batch-logs", {
        params: { latest: true },
      });
      const logs = Array.isArray(response.data?.data) ? response.data.data : [];
      setLatestLogs(logs);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "최신 배치 로그를 불러오지 못했습니다.";
      toast.error("최신 배치 로그 조회 실패", {
        description: message,
      });
    } finally {
      setIsLatestLoading(false);
    }
  }, [pageState]);

  const fetchBatchLogs = useCallback(async (batchType: BatchType, page: number) => {
    if (pageState !== "ready") return;

    setIsBatchLogLoading(true);
    setBatchLogError(null);

    try {
      const response = await clientAxios.get("/admin/batch-logs", {
        params: {
          batchType,
          page,
          size: 20,
        },
      });
      const payload: BatchLogPageResponse | undefined = response.data?.data;
      setBatchLogs(payload?.items ?? []);
      setBatchMeta(payload?.meta ?? null);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "배치 로그 조회 중 오류가 발생했습니다.";
      setBatchLogError(message);
    } finally {
      setIsBatchLogLoading(false);
    }
  }, [pageState]);

  const runTask = async (taskKey: AdminTaskKey, taskTitle: string) => {
    setTaskStates((prev) => ({
      ...prev,
      [taskKey]: { ...prev[taskKey], isRunning: true, message: undefined },
    }));

    try {
      const response = await clientAxios.post(`/admin/tasks/${taskKey}`, undefined, {
        timeout: 3 * 60 * 1000,
      });
      setTaskStates((prev) => ({
        ...prev,
        [taskKey]: {
          isRunning: false,
          lastRunAt: new Date().toISOString(),
          lastStatus: "success",
          statusCode: response.status,
          message: response.data?.message ?? "성공적으로 실행되었습니다.",
          payload: response.data?.data ?? null,
        },
      }));
      toast.success(`${taskTitle} 작업이 실행되었습니다.`);

      await Promise.all([fetchLatestLogs(), fetchBatchLogs(selectedBatchType, batchPage)]);
    } catch (error) {
      const statusCode = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;
      const payload = axios.isAxiosError(error)
        ? error.response?.data
        : null;
      const message = axios.isAxiosError(error)
        ? payload?.message || error.message
        : error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";

      setTaskStates((prev) => ({
        ...prev,
        [taskKey]: {
          isRunning: false,
          lastRunAt: new Date().toISOString(),
          lastStatus: "error",
          statusCode,
          message,
          payload,
        },
      }));

      toast.error(`${taskTitle} 실행 중 오류가 발생했습니다`, {
        description: message,
      });
    }
  };

  useEffect(() => {
    if (pageState !== "ready") return;
    void fetchLatestLogs();
  }, [pageState, fetchLatestLogs]);

  useEffect(() => {
    if (pageState !== "ready") return;
    void fetchBatchLogs(selectedBatchType, batchPage);
  }, [pageState, selectedBatchType, batchPage, fetchBatchLogs]);

  if (pageState === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (pageState === "unauthenticated") {
    return (
      <div className="bg-white dark:bg-navy-800 rounded-3xl border border-gray-200 dark:border-navy-600 p-10 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 mx-auto text-gray-400" />
        <h1 className="text-2xl font-bold">로그인이 필요합니다</h1>
        <p className="text-gray-500">관리자 작업에 접근하려면 먼저 로그인해주세요.</p>
        <div className="flex justify-center gap-3">
          <Link href="/sign-in">
            <Button className="rounded-xl">로그인 하러가기</Button>
          </Link>
          <Link href="/home">
            <Button variant="outline" className="rounded-xl">
              홈으로
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (pageState === "forbidden") {
    return (
      <div className="bg-white dark:bg-navy-800 rounded-3xl border border-red-200 dark:border-red-900/40 p-10 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 mx-auto text-red-400" />
        <h1 className="text-2xl font-bold text-red-500">접근 권한이 없습니다</h1>
        <p className="text-gray-500">
          ADMIN 또는 SUPER_ADMIN 권한이 있는 계정만 이 화면을 이용할 수 있습니다.
        </p>
        <Link href="/home">
          <Button variant="outline" className="rounded-xl">
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-600 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="w-6 h-6 text-blaanid-600 dark:text-coral-400" />
          <div>
            <p className="text-sm text-gray-500">ADMIN 전용</p>
            <h1 className="text-2xl font-bold">운영자 작업 콘솔</h1>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          오픈 API 배치 서버의 배치 및 동기화 작업을 직접 실행할 수 있는 관리 도구입니다. 모든 작업은
          즉시 실행되며, 실행 기록이 화면에 남습니다.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Badge className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs tracking-wide">
            현재 계정: {user?.nickname} ({normalizedRole ?? "UNKNOWN"})
          </Badge>
          <Badge variant="secondary" className="rounded-full text-xs px-3 py-1">
            허용 권한: ADMIN, SUPER_ADMIN
          </Badge>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-600 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CalendarClock className="w-5 h-5 text-blaanid-600 dark:text-coral-300" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  최근 배치 실행 일시
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  배치 타입별 최신 실행 로그
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => void fetchLatestLogs()}
              disabled={isLatestLoading}
            >
              {isLatestLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCcw className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {BATCH_TYPE_OPTIONS.map((batchType) => {
              const log = latestLogMap[batchType];

              return (
                <div
                  key={batchType}
                  className="rounded-2xl border border-gray-200 dark:border-navy-600 bg-gray-50/70 dark:bg-navy-700/60 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                      {formatBatchTypeLabel(batchType)}
                    </p>
                    <Badge
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        log?.isSuccess
                          ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200"
                          : log
                            ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200"
                            : "bg-gray-200 text-gray-600 dark:bg-navy-600 dark:text-gray-200"
                      }`}
                    >
                      {log ? (log.isSuccess ? "성공" : "실패") : "미조회"}
                    </Badge>
                  </div>

                  <dl className="space-y-1.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <dt className="text-gray-500 dark:text-gray-400">시작</dt>
                      <dd className="font-medium text-right text-gray-800 dark:text-gray-100">
                        {formatTimestamp(log?.startedAt)}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <dt className="text-gray-500 dark:text-gray-400">완료</dt>
                      <dd className="font-medium text-right text-gray-800 dark:text-gray-100">
                        {formatTimestamp(log?.completedAt)}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <dt className="text-gray-500 dark:text-gray-400">실행 유형</dt>
                      <dd className="font-medium text-gray-800 dark:text-gray-100">
                        {log ? formatTriggerTypeLabel(log.triggerType) : "-"}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <dt className="text-gray-500 dark:text-gray-400">처리 건수</dt>
                      <dd className="font-mono text-gray-800 dark:text-gray-100">
                        {log ? log.recordCount.toLocaleString() : "-"}
                      </dd>
                    </div>
                  </dl>

                  {log?.message && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 break-words line-clamp-2">
                      {log.message}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </article>

        <article className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-600 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                배치 로그 조회
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                배치 타입별 실행 로그를 페이지 단위로 조회합니다.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedBatchType}
                onChange={(event) => {
                  const nextType = event.target.value as BatchType;
                  setSelectedBatchType(nextType);
                  setBatchPage(1);
                }}
                className="w-full sm:w-auto rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-700 px-3 py-2 text-sm"
              >
                {BATCH_TYPE_OPTIONS.map((batchType) => (
                  <option key={batchType} value={batchType}>
                    {formatBatchTypeLabel(batchType)}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => void fetchBatchLogs(selectedBatchType, batchPage)}
                disabled={isBatchLogLoading}
              >
                {isBatchLogLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCcw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {batchLogError && (
            <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-600 dark:text-red-300">
              {batchLogError}
            </div>
          )}

          <div className="space-y-3">
            {isBatchLogLoading ? (
              <div className="h-[220px] rounded-2xl border border-dashed border-gray-300 dark:border-navy-600 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : batchLogs.length === 0 ? (
              <div className="h-[220px] rounded-2xl border border-dashed border-gray-300 dark:border-navy-600 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                조회된 로그가 없습니다.
              </div>
            ) : (
              batchLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-gray-200 dark:border-navy-600 bg-gray-50/70 dark:bg-navy-700/60 p-4"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatTimestamp(log.startedAt)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className="rounded-full px-2.5 py-0.5 text-[10px] bg-gray-200 text-gray-700 dark:bg-navy-600 dark:text-gray-100">
                        {formatTriggerTypeLabel(log.triggerType)}
                      </Badge>
                      <Badge
                        className={`rounded-full px-2.5 py-0.5 text-[10px] ${
                          log.isSuccess
                            ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200"
                            : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200"
                        }`}
                      >
                        {log.isSuccess ? "성공" : "실패"}
                      </Badge>
                    </div>
                  </div>

                  <dl className="mt-3 grid gap-2 text-xs text-gray-600 dark:text-gray-300 sm:grid-cols-2">
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">완료 시각</dt>
                      <dd className="font-medium text-gray-800 dark:text-gray-100">
                        {formatTimestamp(log.completedAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">처리 건수</dt>
                      <dd className="font-mono text-gray-800 dark:text-gray-100">
                        {log.recordCount.toLocaleString()}
                      </dd>
                    </div>
                  </dl>

                  {log.message && (
                    <p className="mt-3 text-xs text-gray-700 dark:text-gray-200 break-words">
                      {log.message}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {batchMeta
                ? `${batchMeta.currentPage} / ${batchMeta.totalPages} 페이지 (총 ${batchMeta.totalElements.toLocaleString()}건)`
                : "-"}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={isBatchLogLoading || !!batchMeta?.isFirst}
                onClick={() => setBatchPage((prev) => Math.max(1, prev - 1))}
              >
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={isBatchLogLoading || !!batchMeta?.isLast || !batchMeta}
                onClick={() => setBatchPage((prev) => prev + 1)}
              >
                다음
              </Button>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {ADMIN_TASKS.map((task) => {
          const state = taskStates[task.key];
          const Icon = task.icon;
          const payloadText = formatPayload(state?.payload);

          return (
            <article
              key={task.key}
              className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-600 rounded-3xl p-6 flex flex-col gap-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-navy-700 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gray-600 dark:text-gray-200" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {task.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {task.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{task.backendEndpoint}</p>
                  </div>
                </div>
                <Badge className="rounded-full px-3 py-1 text-xs bg-blaanid-50 text-blaanid-600 dark:bg-coral-500/20 dark:text-coral-200">
                  {task.category}
                </Badge>
              </div>

              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">마지막 실행</dt>
                  <dd className="font-medium text-gray-900 dark:text-gray-100">
                    {formatTimestamp(state?.lastRunAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">결과</dt>
                  <dd
                    className={`font-medium ${
                      state?.lastStatus === "success"
                        ? "text-green-600"
                        : state?.lastStatus === "error"
                          ? "text-red-500"
                          : "text-gray-400"
                    }`}
                  >
                    {state?.message ?? "미실행"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">HTTP Status</dt>
                  <dd className="font-mono text-gray-800 dark:text-gray-200">
                    {state?.statusCode ?? "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">API 경로</dt>
                  <dd className="font-mono text-xs text-gray-600">/api/admin/tasks/{task.key}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => runTask(task.key, task.title)}
                  disabled={state?.isRunning}
                  className="rounded-xl"
                >
                  {state?.isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      실행 중...
                    </>
                  ) : (
                    <>작업 실행</>
                  )}
                </Button>
                {state?.lastStatus === "success" && (
                  <span className="text-xs text-green-600">최근 작업 성공</span>
                )}
                {state?.lastStatus === "error" && (
                  <span className="text-xs text-red-500">최근 작업 실패</span>
                )}
              </div>

              {payloadText && (
                <pre className="text-xs bg-gray-50 dark:bg-navy-700 rounded-2xl p-4 overflow-x-auto border border-gray-100 dark:border-navy-600">
                  {payloadText}
                </pre>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
