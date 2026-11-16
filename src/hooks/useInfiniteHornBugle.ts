"use client";

import {
  type InfiniteData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { liveQueryOptions } from "@/lib/api/live-query";
import { fetchHornBugle } from "@/lib/horn-bugle";
import type {
  HornBugleResponse,
  HornBugleSearchParams,
} from "@/types/horn-bugle";

export function useInfiniteHornBugle(
  params: Omit<HornBugleSearchParams, "page">,
) {
  const queryClient = useQueryClient();
  const serverName = params.serverName;
  const keyword = params.keyword;
  const filters = useMemo(
    () => ({ serverName, keyword }),
    [serverName, keyword],
  );
  const queryKey = useMemo(() => ["horn-bugle", filters] as const, [filters]);
  const headKey = useMemo(
    () => ["horn-bugle-head", filters] as const,
    [filters],
  );
  const scope = JSON.stringify(queryKey);
  const activeScope = useRef<string | null>(scope);
  const generation = useRef(0);
  const pendingRefresh = useRef<{
    scope: string;
    token: symbol;
    promise: Promise<boolean>;
  } | null>(null);
  const [refreshState, setRefreshState] = useState<{
    scope: string;
    pending: boolean;
    error: Error | null;
  }>({ scope, pending: false, error: null });
  const isRefreshing = refreshState.scope === scope && refreshState.pending;

  useEffect(() => {
    generation.current += 1;
    activeScope.current = scope;
    setRefreshState({ scope, pending: false, error: null });
    return () => {
      generation.current += 1;
      activeScope.current = null;
      pendingRefresh.current = null;
      void queryClient.cancelQueries({ queryKey: headKey, exact: true });
    };
  }, [scope, headKey, queryClient]);

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1, signal }) => {
      const page = await fetchHornBugle(
        { ...filters, page: pageParam, size: 20 },
        signal,
      );
      // Seed the head check instead of fetching page one twice on initial load.
      if (pageParam === 1) queryClient.setQueryData(headKey, page);
      return page;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.isLast) return undefined;
      return lastPage.meta.currentPage + 1;
    },
    staleTime: 60_000,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const head = useQuery({
    queryKey: headKey,
    queryFn: ({ signal }) =>
      fetchHornBugle({ ...filters, page: 1, size: 20 }, signal),
    ...liveQueryOptions,
    enabled: query.data !== undefined && !isRefreshing,
    retry: false,
  });
  const { refetch: refetchHead } = head;

  const refreshLatest = useCallback((): Promise<boolean> => {
    if (pendingRefresh.current?.scope === scope)
      return pendingRefresh.current.promise;
    const startedGeneration = generation.current;
    const token = Symbol();
    const isCurrent = () =>
      activeScope.current === scope && generation.current === startedGeneration;
    setRefreshState({ scope, pending: true, error: null });
    const promise = (async () => {
      try {
        const result = await refetchHead({ cancelRefetch: false });
        if (!isCurrent()) return false;
        if (result.isError || !result.data)
          throw result.error ?? new Error("뿔피리 조회 실패");
        await queryClient.cancelQueries({ queryKey, exact: true });
        if (!isCurrent()) return false;
        queryClient.setQueryData<InfiniteData<HornBugleResponse, number>>(
          queryKey,
          { pages: [result.data], pageParams: [1] },
          { updatedAt: result.dataUpdatedAt },
        );
        setRefreshState({ scope, pending: false, error: null });
        return true;
      } catch (error) {
        if (isCurrent()) {
          setRefreshState({
            scope,
            pending: false,
            error:
              error instanceof Error ? error : new Error("뿔피리 조회 실패"),
          });
        }
        return false;
      } finally {
        if (pendingRefresh.current?.token === token)
          pendingRefresh.current = null;
      }
    })();
    pendingRefresh.current = { scope, token, promise };
    return promise;
  }, [scope, refetchHead, queryClient, queryKey]);

  const firstPage = query.data?.pages[0];
  const hasNewMessages = Boolean(
    firstPage &&
      head.data &&
      JSON.stringify(firstPage.items) !== JSON.stringify(head.data.items),
  );

  return {
    ...query,
    refreshLatest,
    isRefreshing,
    refreshError: refreshState.scope === scope ? refreshState.error : null,
    checkError: head.error,
    isChecking: head.isFetching,
    hasNewMessages,
    lastCheckedAt: head.dataUpdatedAt || query.dataUpdatedAt,
  };
}
